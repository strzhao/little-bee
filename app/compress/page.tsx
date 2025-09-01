import type { Metadata } from 'next';
import { ImageCompressor } from '@/components/image-compressor';

export const metadata: Metadata = {
  title: '在线图片压缩工具 - 免费高效，保护隐私',
  description:
    '使用我们的免费在线图片压缩工具，快速减小 JPG、PNG、WEBP 等格式的图片文件大小。所有操作均在您的浏览器中完成，无需上传，确保您的数据安全和隐私。',
};

export default function CompressPage() {
  return <ImageCompressor />;
}
