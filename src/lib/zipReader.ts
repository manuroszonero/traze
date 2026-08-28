/**
 * Pure Web-Native Zero-Dependency ZIP Reader & Writer
 * Supports uncompressed (Stored) and Deflate-compressed ZIP entries using standard DecompressionStream.
 */

export interface ZipEntry {
  name: string;
  dir: boolean;
  compressedSize: number;
  uncompressedSize: number;
  compressionMethod: number;
  offset: number;
  async: (type: 'text' | 'uint8array' | 'blob') => Promise<any>;
}

export class NativeZip {
  private buffer: ArrayBuffer | null = null;
  private entries: Map<string, ZipEntry> = new Map();

  static async loadAsync(fileOrBlobOrBuffer: Blob | File | ArrayBuffer | Uint8Array): Promise<NativeZip> {
    const zip = new NativeZip();
    let buffer: ArrayBuffer;

    if (fileOrBlobOrBuffer instanceof ArrayBuffer) {
      buffer = fileOrBlobOrBuffer;
    } else if (fileOrBlobOrBuffer instanceof Uint8Array) {
      buffer = fileOrBlobOrBuffer.buffer.slice(
        fileOrBlobOrBuffer.byteOffset,
        fileOrBlobOrBuffer.byteOffset + fileOrBlobOrBuffer.byteLength
      ) as ArrayBuffer;
    } else if (typeof Blob !== 'undefined' && fileOrBlobOrBuffer instanceof Blob) {
      buffer = await fileOrBlobOrBuffer.arrayBuffer();
    } else {
      throw new Error('Unsupported input format for ZIP extraction.');
    }

    zip.buffer = buffer;
    await zip.parseCentralDirectory();
    return zip;
  }

  private async parseCentralDirectory(): Promise<void> {
    if (!this.buffer) return;
    const view = new DataView(this.buffer);
    const bytes = new Uint8Array(this.buffer);

    // 1. Locate End of Central Directory (EOCD) signature 0x06054b50 from the back
    let eocdOffset = -1;
    const maxSearch = Math.min(bytes.length, 65536 + 22);
    for (let i = bytes.length - 22; i >= bytes.length - maxSearch; i--) {
      if (view.getUint32(i, true) === 0x06054b50) {
        eocdOffset = i;
        break;
      }
    }

    if (eocdOffset === -1) {
      throw new Error('Invalid ZIP archive: End of Central Directory signature not found.');
    }

    const totalEntries = view.getUint16(eocdOffset + 10, true);
    const cdOffset = view.getUint32(eocdOffset + 16, true);

    let currentOffset = cdOffset;
    const textDecoder = new TextDecoder('utf-8');

    for (let i = 0; i < totalEntries; i++) {
      if (currentOffset + 46 > bytes.length) break;
      const signature = view.getUint32(currentOffset, true);
      if (signature !== 0x02014b50) break; // Central directory file header signature

      const compressionMethod = view.getUint16(currentOffset + 10, true);
      const compressedSize = view.getUint32(currentOffset + 20, true);
      const uncompressedSize = view.getUint32(currentOffset + 24, true);
      const fileNameLength = view.getUint16(currentOffset + 28, true);
      const extraFieldLength = view.getUint16(currentOffset + 30, true);
      const fileCommentLength = view.getUint16(currentOffset + 32, true);
      const localHeaderOffset = view.getUint32(currentOffset + 42, true);

      const fileNameBytes = bytes.subarray(currentOffset + 46, currentOffset + 46 + fileNameLength);
      const fileName = textDecoder.decode(fileNameBytes);
      const isDir = fileName.endsWith('/');

      const entry: ZipEntry = {
        name: fileName,
        dir: isDir,
        compressedSize,
        uncompressedSize,
        compressionMethod,
        offset: localHeaderOffset,
        async: async (type: 'text' | 'uint8array' | 'blob') => {
          return this.extractEntry(entry, type);
        },
      };

      this.entries.set(fileName, entry);
      currentOffset += 46 + fileNameLength + extraFieldLength + fileCommentLength;
    }
  }

  private async extractEntry(entry: ZipEntry, type: 'text' | 'uint8array' | 'blob'): Promise<any> {
    if (!this.buffer) throw new Error('No buffer loaded');
    const view = new DataView(this.buffer);
    const bytes = new Uint8Array(this.buffer);

    const localOffset = entry.offset;
    if (view.getUint32(localOffset, true) !== 0x04034b50) {
      throw new Error(`Invalid local header signature for entry ${entry.name}`);
    }

    const localFileNameLen = view.getUint16(localOffset + 26, true);
    const localExtraLen = view.getUint16(localOffset + 28, true);
    const dataStart = localOffset + 30 + localFileNameLen + localExtraLen;
    const compressedSlice = bytes.subarray(dataStart, dataStart + entry.compressedSize);

    let decompressed: Uint8Array;

    if (entry.compressionMethod === 0) {
      decompressed = compressedSlice;
    } else if (entry.compressionMethod === 8) {
      if (typeof DecompressionStream !== 'undefined') {
        const ds = new DecompressionStream('deflate-raw');
        const writer = ds.writable.getWriter();
        writer.write(compressedSlice);
        writer.close();

        const chunks: Uint8Array[] = [];
        const reader = ds.readable.getReader();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) chunks.push(value);
        }

        let totalLen = 0;
        for (const c of chunks) totalLen += c.length;
        decompressed = new Uint8Array(totalLen);
        let pos = 0;
        for (const c of chunks) {
          decompressed.set(c, pos);
          pos += c.length;
        }
      } else {
        throw new Error('DecompressionStream is not available in this environment.');
      }
    } else {
      throw new Error(`Unsupported compression method: ${entry.compressionMethod}`);
    }

    if (type === 'text') {
      return new TextDecoder('utf-8').decode(decompressed);
    }
    if (type === 'uint8array') {
      return decompressed;
    }
    if (type === 'blob') {
      return new Blob([decompressed]);
    }
    return decompressed;
  }

  forEach(callback: (relativePath: string, file: ZipEntry) => void): void {
    for (const [name, entry] of this.entries.entries()) {
      callback(name, entry);
    }
  }

  file(name: string): ZipEntry | null {
    return this.entries.get(name) || null;
  }

  static create(): ZipBuilder {
    return new ZipBuilder();
  }
}

export class ZipBuilder {
  private files: Array<{ name: string; content: Uint8Array | string }> = [];

  static create(): ZipBuilder {
    return new ZipBuilder();
  }

  file(name: string, content: string | Uint8Array): ZipBuilder {
    this.files.push({ name, content });
    return this;
  }

  async generateAsync(options: { type: 'blob' | 'uint8array' | 'nodebuffer' }): Promise<any> {
    const textEncoder = new TextEncoder();
    const localHeaders: Uint8Array[] = [];
    const centralHeaders: Uint8Array[] = [];
    let currentOffset = 0;

    for (const file of this.files) {
      const nameBytes = textEncoder.encode(file.name);
      const contentBytes = typeof file.content === 'string' ? textEncoder.encode(file.content) : file.content;
      const crc = crc32(contentBytes);
      const size = contentBytes.length;

      // Local Header (30 bytes + name + content)
      const localHdr = new Uint8Array(30 + nameBytes.length + size);
      const localView = new DataView(localHdr.buffer);
      localView.setUint32(0, 0x04034b50, true);
      localView.setUint16(4, 20, true); // Version
      localView.setUint16(6, 0, true); // Flags
      localView.setUint16(8, 0, true); // Method 0 (Stored)
      localView.setUint16(10, 0, true); // Time
      localView.setUint16(12, 0, true); // Date
      localView.setUint32(14, crc, true); // CRC32
      localView.setUint32(18, size, true); // Compressed size
      localView.setUint32(22, size, true); // Uncompressed size
      localView.setUint16(26, nameBytes.length, true);
      localView.setUint16(28, 0, true); // Extra length
      localHdr.set(nameBytes, 30);
      localHdr.set(contentBytes, 30 + nameBytes.length);

      localHeaders.push(localHdr);

      // Central Directory Header (46 bytes + name)
      const cdHdr = new Uint8Array(46 + nameBytes.length);
      const cdView = new DataView(cdHdr.buffer);
      cdView.setUint32(0, 0x02014b50, true);
      cdView.setUint16(4, 20, true);
      cdView.setUint16(6, 20, true);
      cdView.setUint16(8, 0, true);
      cdView.setUint16(10, 0, true); // Method 0
      cdView.setUint16(12, 0, true);
      cdView.setUint16(14, 0, true);
      cdView.setUint32(16, crc, true);
      cdView.setUint32(20, size, true);
      cdView.setUint32(24, size, true);
      cdView.setUint16(28, nameBytes.length, true);
      cdView.setUint16(30, 0, true);
      cdView.setUint16(32, 0, true);
      cdView.setUint16(34, 0, true);
      cdView.setUint16(36, 0, true);
      cdView.setUint32(38, 0, true);
      cdView.setUint32(42, currentOffset, true); // Local offset
      cdHdr.set(nameBytes, 46);

      centralHeaders.push(cdHdr);

      currentOffset += localHdr.length;
    }

    const cdStartOffset = currentOffset;
    let cdSize = 0;
    for (const h of centralHeaders) cdSize += h.length;

    // End of Central Directory (22 bytes)
    const eocd = new Uint8Array(22);
    const eocdView = new DataView(eocd.buffer);
    eocdView.setUint32(0, 0x06054b50, true);
    eocdView.setUint16(4, 0, true);
    eocdView.setUint16(6, 0, true);
    eocdView.setUint16(8, this.files.length, true);
    eocdView.setUint16(10, this.files.length, true);
    eocdView.setUint32(12, cdSize, true);
    eocdView.setUint32(16, cdStartOffset, true);
    eocdView.setUint16(20, 0, true);

    const totalSize = currentOffset + cdSize + 22;
    const finalBuffer = new Uint8Array(totalSize);
    let writePos = 0;

    for (const h of localHeaders) {
      finalBuffer.set(h, writePos);
      writePos += h.length;
    }
    for (const h of centralHeaders) {
      finalBuffer.set(h, writePos);
      writePos += h.length;
    }
    finalBuffer.set(eocd, writePos);

    if (options.type === 'blob') {
      return new Blob([finalBuffer], { type: 'application/zip' });
    }
    if (options.type === 'nodebuffer') {
      return (typeof Buffer !== 'undefined' ? Buffer.from(finalBuffer) : finalBuffer) as any;
    }
    return finalBuffer;
  }
}

function crc32(buf: Uint8Array): number {
  let crc = -1;
  const table = getCrcTable();
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

let crcTable: Uint32Array | null = null;
function getCrcTable(): Uint32Array {
  if (crcTable) return crcTable;
  crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[i] = c;
  }
  return crcTable;
}
