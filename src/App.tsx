import { useState, useRef } from 'react'
import './App.css'
import html2canvas from 'html2canvas'

interface ImageConfig {
  url: string;
  width: number;
  height: number;
}

interface ImageState {
  left: ImageConfig[];
  right: ImageConfig[];
}

type PaperSize = 'A4' | 'A5';

interface PaperConfig {
  width: number;
  height: number;
  gridRows: number;
}

const PAPER_CONFIGS: Record<PaperSize, PaperConfig> = {
  'A4': {
    width: 210,
    height: 297,
    gridRows: 4
  },
  'A5': {
    width: 148,
    height: 210,
    gridRows: 2
  }
};

function App() {
  const [images, setImages] = useState<ImageState>({ left: [], right: [] })
  const [paperSize, setPaperSize] = useState<PaperSize>('A4')
  const [dpi, setDpi] = useState<number>(300)
  const leftEyeInputRef = useRef<HTMLInputElement>(null)
  const rightEyeInputRef = useRef<HTMLInputElement>(null)
  const printAreaRef = useRef<HTMLDivElement>(null)

  const handleImageUpload = (eye: 'left' | 'right', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || file.type !== 'image/png') return

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setImages(prev => ({
          ...prev,
          [eye]: [...prev[eye], {
            url: e.target?.result as string,
            width: 25, // 默认 25mm
            height: 25, // 默认 25mm
          }]
        }))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = (eye: 'left' | 'right', index: number) => {
    setImages(prev => ({
      ...prev,
      [eye]: prev[eye].filter((_, i) => i !== index)
    }))
  }

  const handleSizeChange = (eye: 'left' | 'right', index: number, dimension: 'width' | 'height', value: string) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue <= 0) return

    setImages(prev => ({
      ...prev,
      [eye]: prev[eye].map((img, i) =>
        i === index ? { ...img, [dimension]: numValue } : img
      )
    }))
  }

  const handlePrint = () => {
    window.print()
  }

  const handleGeneratePNG = async () => {
    if (!printAreaRef.current) return

    const scale = dpi / 96 // 将 DPI 转换为缩放比例（96 是默认的屏幕 DPI）

    try {
      const canvas = await html2canvas(printAreaRef.current, {
        scale,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      // 创建下载链接
      const link = document.createElement('a')
      link.download = `print-${paperSize}-${dpi}dpi.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('生成 PNG 时出错:', error)
    }
  }

  const paperConfig = PAPER_CONFIGS[paperSize]
  const { left: leftImages, right: rightImages } = images

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      <div className="mx-auto px-4 py-8">
        <div className="mb-8">
          <div>
            <img src="/logo.svg" alt="KIGLAND Logo" className="mx-auto mb-4 w-24 h-24" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-[#536CB5]">🔧 KIGLAND UV 眼片排版工具</h1>

          {/* 控制面板 */}
          <div className="bg-white rounded-lg shadow-lg p-4 mb-4 border border-[#E8EAF6]">
            {/* 文件上传和纸张设置 */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => leftEyeInputRef.current?.click()}
                  className="bg-[#536CB5] text-white px-4 py-2 rounded hover:bg-[#4A61A4] flex items-center gap-1 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  左眼图片
                </button>
                <input
                  ref={leftEyeInputRef}
                  type="file"
                  accept="image/png"
                  onChange={(e) => handleImageUpload('left', e)}
                  className="hidden"
                />
                <button
                  onClick={() => rightEyeInputRef.current?.click()}
                  className="bg-[#536CB5] text-white px-4 py-2 rounded hover:bg-[#4A61A4] flex items-center gap-1 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  右眼图片
                </button>
                <input
                  ref={rightEyeInputRef}
                  type="file"
                  accept="image/png"
                  onChange={(e) => handleImageUpload('right', e)}
                  className="hidden"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-[#536CB5]">纸张:</label>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value as PaperSize)}
                  className="border border-[#E8EAF6] rounded px-3 py-1.5 text-gray-700 bg-white focus:ring-2 focus:ring-[#536CB5] focus:border-[#536CB5] transition-colors"
                >
                  <option value="A4">A4 (8张眼片)</option>
                  <option value="A5">A5 (4张眼片)</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-[#536CB5]">DPI:</label>
                <input
                  type="number"
                  value={dpi}
                  onChange={(e) => setDpi(Math.max(72, Math.min(1200, parseInt(e.target.value) || 300)))}
                  className="border border-[#E8EAF6] rounded px-3 py-1.5 w-24 text-gray-700 focus:ring-2 focus:ring-[#536CB5] focus:border-[#536CB5] transition-colors"
                  min="72"
                  max="1200"
                />
              </div>
            </div>

            {/* 操作按钮 */}
            {(leftImages.length > 0 || rightImages.length > 0) && (
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-[#4CAF50] text-white px-4 py-2 rounded hover:bg-[#43A047] flex items-center gap-1 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                  </svg>
                  打印
                </button>
                <button
                  onClick={handleGeneratePNG}
                  className="bg-[#536CB5] text-white px-4 py-2 rounded hover:bg-[#4A61A4] flex items-center gap-1 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  生成PNG
                </button>
              </div>
            )}
          </div>

          {/* 图片列表 */}
          <div className="flex gap-8">
            {/* 左眼预览 */}
            {leftImages.length > 0 && (
              <div className="flex-1">
                <h2 className="font-medium mb-4 text-[#536CB5]">左眼图片</h2>
                <div className="space-y-4">
                  {leftImages.map((img, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow border border-[#E8EAF6]">
                      <div className="flex gap-4 mb-4">
                        <img src={img.url} alt={`左眼 ${index + 1}`} className="w-24 h-24 object-cover rounded" />
                        <div className="flex-1">
                          <p className="text-sm text-[#536CB5] mb-2">左眼图片 {index + 1}</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <label className="text-sm w-12 text-[#536CB5]">宽度:</label>
                              <input
                                type="number"
                                value={img.width}
                                onChange={(e) => handleSizeChange('left', index, 'width', e.target.value)}
                                className="w-20 px-2 py-1 border border-[#E8EAF6] rounded text-sm focus:ring-2 focus:ring-[#536CB5] focus:border-[#536CB5] transition-colors"
                                min="1"
                                step="0.1"
                              />
                              <span className="text-sm text-gray-500">mm</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-sm w-12 text-[#536CB5]">高度:</label>
                              <input
                                type="number"
                                value={img.height}
                                onChange={(e) => handleSizeChange('left', index, 'height', e.target.value)}
                                className="w-20 px-2 py-1 border border-[#E8EAF6] rounded text-sm focus:ring-2 focus:ring-[#536CB5] focus:border-[#536CB5] transition-colors"
                                min="1"
                                step="0.1"
                              />
                              <span className="text-sm text-gray-500">mm</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveImage('left', index)}
                          className="text-[#FF5252] text-sm hover:text-[#FF1744] self-start transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 右眼预览 */}
            {rightImages.length > 0 && (
              <div className="flex-1">
                <h2 className="font-medium mb-4 text-[#536CB5]">右眼图片</h2>
                <div className="space-y-4">
                  {rightImages.map((img, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow border border-[#E8EAF6]">
                      <div className="flex gap-4 mb-4">
                        <img src={img.url} alt={`右眼 ${index + 1}`} className="w-24 h-24 object-cover rounded" />
                        <div className="flex-1">
                          <p className="text-sm text-[#536CB5] mb-2">右眼图片 {index + 1}</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <label className="text-sm w-12 text-[#536CB5]">宽度:</label>
                              <input
                                type="number"
                                value={img.width}
                                onChange={(e) => handleSizeChange('right', index, 'width', e.target.value)}
                                className="w-20 px-2 py-1 border border-[#E8EAF6] rounded text-sm focus:ring-2 focus:ring-[#536CB5] focus:border-[#536CB5] transition-colors"
                                min="1"
                                step="0.1"
                              />
                              <span className="text-sm text-gray-500">mm</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-sm w-12 text-[#536CB5]">高度:</label>
                              <input
                                type="number"
                                value={img.height}
                                onChange={(e) => handleSizeChange('right', index, 'height', e.target.value)}
                                className="w-20 px-2 py-1 border border-[#E8EAF6] rounded text-sm focus:ring-2 focus:ring-[#536CB5] focus:border-[#536CB5] transition-colors"
                                min="1"
                                step="0.1"
                              />
                              <span className="text-sm text-gray-500">mm</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveImage('right', index)}
                          className="text-[#FF5252] text-sm hover:text-[#FF1744] self-start transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* A4 预览区域 */}
        <div className={`bg-white mx-auto shadow-lg p-4`}>
          <div
            ref={printAreaRef}
            style={{
              width: `${paperConfig.width}mm`,
              height: `${paperConfig.height}mm`,
              backgroundColor: '#ffffff'
            }}
          >
            <div className={`grid grid-cols-2 h-full gap-4`} style={{
              gridTemplateRows: `repeat(${paperConfig.gridRows}, 1fr)`
            }}>
              {Array(paperConfig.gridRows * 2).fill(null).map((_, index) => {
                const isLeftPosition = index % 2 === 0
                const images = isLeftPosition ? leftImages : rightImages
                const imageIndex = Math.floor(index / 2) % images.length
                const image = images[imageIndex]

                return (
                  <div key={index} className="border border-gray-200 flex items-center justify-center relative">
                    {image && (
                      <>
                        <img
                          src={image.url}
                          alt={`${isLeftPosition ? '左' : '右'}眼 ${imageIndex + 1}`}
                          style={{
                            width: `${image.width}mm`,
                            height: `${image.height}mm`,
                          }}
                          className="object-fill"
                        />
                        <span className="absolute top-2 left-2 text-sm text-gray-500">
                          {isLeftPosition ? '左' : '右'}眼 {imageIndex + 1}
                          <br />
                          <span className="text-xs">
                            {image.width}×{image.height}mm
                          </span>
                        </span>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
