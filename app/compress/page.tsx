"use client";

import { useState, useCallback, useEffect } from "react";
import imageCompression from "browser-image-compression";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import gifsicle from 'gifsicle-wasm-browser';

// --- UI Components ---
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// --- Helper Icons ---
const UploadCloudIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </svg>
);

const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
);

// --- Types ---
type CompressionLevel = "small" | "recommended" | "high";

interface CompressedFileResult {
  originalFile: File;
  compressedFile: Blob;
  originalSize: number;
  compressedSize: number;
  previewUrl: string;
}

// --- Helper Functions ---
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const compressGif = async (file: File, level: CompressionLevel): Promise<Blob> => {
    const optimizationLevels = {
        small: '-O3 --lossy=120 --colors 64',
        recommended: '-O3 --lossy=60 --colors 96', 
        high: '-O2 --lossy=20 --colors 128',
    };
    try {
        console.log('Starting GIF compression with level:', level);
        console.log('Input file size:', file.size, 'bytes');
        
        // Convert File to ArrayBuffer for gifsicle
        const arrayBuffer = await file.arrayBuffer();
        console.log('ArrayBuffer size:', arrayBuffer.byteLength, 'bytes');
        
        const result = await gifsicle.run({
            input: [{ file: arrayBuffer, name: "input.gif" }],
            command: [`${optimizationLevels[level]} --resize-method=lanczos3 --optimize=3 input.gif -o /out/output.gif`],
        });
        
        console.log('Gifsicle result:', result);
        console.log('Result type:', typeof result);
        console.log('Result length:', result?.length);
        
        if (!result || result.length === 0) {
            console.error('Gifsicle returned no results');
            throw new Error('Gifsicle returned empty result');
        }
        
        // gifsicle.run returns an array of File objects
        const outputFile = result[0];
        console.log('Output file:', outputFile);
        console.log('Output file type:', typeof outputFile);
        console.log('Output file size:', outputFile.size, 'bytes');
        
        if (!outputFile || outputFile.size === 0) {
            console.error('Output file is empty or invalid');
            throw new Error('Gifsicle returned empty file');
        }
        
        // Convert File to Blob
        return new Blob([await outputFile.arrayBuffer()], { type: 'image/gif' });
    } catch (error) {
        console.error('GIF compression failed:', error);
        // 如果压缩失败，返回原文件
        return new Blob([await file.arrayBuffer()], { type: 'image/gif' });
    }
};


// --- Main Component ---
export default function ImageCompressorPage() {
  const [sourceFiles, setSourceFiles] = useState<File[]>([]);
  const [compressedResults, setCompressedResults] = useState<CompressedFileResult[]>([]);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>("recommended");
  const [isCompressing, setIsCompressing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [processedFiles, setProcessedFiles] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  const processFiles = useCallback(async (files: File[], level: CompressionLevel) => {
    setIsCompressing(true);
    setProcessedFiles(0);
    setTotalFiles(files.length);

    const getOptions = (level: CompressionLevel) => {
        switch (level) {
            case "small":
                return { maxSizeMB: 0.5, initialQuality: 0.6, };
            case "high":
                return { maxSizeMB: 2, initialQuality: 0.95, };
            case "recommended":
            default:
                return { maxSizeMB: 1, initialQuality: 0.8, };
        }
    }

    const options = { ...getOptions(level), useWebWorker: true };

    const newResults: CompressedFileResult[] = [];
    for (const [index, file] of files.entries()) {
        if (!file.type.startsWith('image/')) continue;
        try {
            let compressedFile: Blob;
            if (file.type === 'image/gif') {
                compressedFile = await compressGif(file, level);
            } else {
                compressedFile = await imageCompression(file, options);
            }
            newResults.push({
                originalFile: file,
                compressedFile,
                originalSize: file.size,
                compressedSize: compressedFile.size,
                previewUrl: URL.createObjectURL(compressedFile),
            });
        } catch (error) {
            console.error("Error compressing file:", error);
        }
        setProcessedFiles(index + 1);
    }
    
    setCompressedResults(prevResults => {
        prevResults.forEach(r => URL.revokeObjectURL(r.previewUrl));
        return newResults;
    });
    setIsCompressing(false);
    setProcessedFiles(0);
  }, []);

  useEffect(() => {
    if (sourceFiles.length > 0) {
        processFiles(sourceFiles, compressionLevel);
    }
  }, [sourceFiles, compressionLevel, processFiles]);

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      setSourceFiles(Array.from(files));
    }
  };

  const handleDownload = (result: CompressedFileResult) => {
    saveAs(result.compressedFile, `compressed-${result.originalFile.name}`);
  };

  const handleDownloadAll = async () => {
    if (compressedResults.length === 0) return;
    setIsZipping(true);
    const zip = new JSZip();
    compressedResults.forEach((result) => {
      zip.file(`compressed-${result.originalFile.name}`, result.compressedFile);
    });
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "compressed-images.zip");
    setIsZipping(false);
  };

  const handleClear = () => {
    compressedResults.forEach(result => URL.revokeObjectURL(result.previewUrl));
    setSourceFiles([]);
    setCompressedResults([]);
  };

  const UploadArea = () => (
    <div 
        className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto mt-10 p-10 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-blue-500 transition-colors"
        onDragOver={(e) => {e.preventDefault(); e.stopPropagation();}}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleFileSelect(e.dataTransfer.files);}}
        onClick={() => document.getElementById('file-input')?.click()}
    >
        <UploadCloudIcon className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700">拖拽或点击上传图片</h2>
        <p className="text-gray-500 mt-2">支持 JPG, PNG, WEBP, GIF 格式，可批量上传</p>
        <Input id="file-input" type="file" multiple accept="image/*,.gif" className="hidden" onChange={(e) => handleFileSelect(e.target.files)} />
    </div>
  );

  const CompressionProgress = () => (
    <div className="w-full max-w-2xl mx-auto mt-10 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">正在为您压缩图片...</h2>
        <Progress value={totalFiles > 0 ? (processedFiles / totalFiles) * 100 : 0} className="w-full mb-2" />
        <p className="text-gray-500 mt-2">
            {isCompressing ? `正在处理第 ${processedFiles} / ${totalFiles} 个文件...` : "已完成"}
        </p>
    </div>
  );

  const ResultsView = () => (
    <div className="w-full max-w-6xl mx-auto mt-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-3xl font-bold">压缩完成</h2>
            <div className="flex items-center gap-4">
                <ToggleGroup type="single" value={compressionLevel} onValueChange={(value: CompressionLevel) => value && setCompressionLevel(value)} aria-label="Compression Level">
                    <ToggleGroupItem value="small" aria-label="Smallest Size">更小体积</ToggleGroupItem>
                    <ToggleGroupItem value="recommended" aria-label="Recommended">智能推荐</ToggleGroupItem>
                    <ToggleGroupItem value="high" aria-label="Higher Quality">更高质量</ToggleGroupItem>
                </ToggleGroup>
                <Button onClick={handleClear} variant="outline">清空</Button>
                <Button onClick={handleDownloadAll} disabled={isZipping}>
                    {isZipping ? "正在打包..." : "下载全部"}
                </Button>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {compressedResults.map((result, index) => (
                <Card key={index} className="overflow-hidden">
                    <CardHeader className="p-0">
                        <img src={result.previewUrl} alt={result.originalFile.name} className="w-full h-48 object-cover" />
                    </CardHeader>
                    <CardContent className="p-4">
                        <p className="text-sm font-medium truncate mb-2" title={result.originalFile.name}>{result.originalFile.name}</p>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">原大小:</span>
                            <span className="font-mono">{formatBytes(result.originalSize)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-semibold text-green-600">
                            <span>新大小:</span>
                            <span className="font-mono">{formatBytes(result.compressedSize)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 my-3">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(result.compressedSize / result.originalSize) * 100}%` }}></div>
                        </div>
                        <div className="text-center text-lg font-bold text-green-600 mb-3">
                            ↓ {Math.round(100 - (result.compressedSize / result.originalSize) * 100)}%
                        </div>
                        <Button className="w-full" onClick={() => handleDownload(result)}>
                            <DownloadIcon className="mr-2 h-4 w-4" /> 下载
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );

  return (
    <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">图像压缩工具</h1>
            <p className="mt-4 text-lg text-gray-600">在您的浏览器中快速、安全地批量压缩图片。</p>
        </div>

        {isCompressing && compressedResults.length === 0 ? <CompressionProgress /> : (sourceFiles.length === 0 ? <UploadArea /> : <ResultsView />)}
    </main>
  );
}