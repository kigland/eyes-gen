import { useState, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
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
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">KIGLAND UV 眼片排版工具</h1>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 items-center">
              <div className="flex gap-4">
                <button
                  onClick={() => leftEyeInputRef.current?.click()}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  添加左眼图片
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
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  添加右眼图片
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
                <label className="text-sm font-medium">纸张大小:</label>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value as PaperSize)}
                  className="border rounded px-2 py-1"
                >
                  <option value="A4">A4 (8张眼片)</option>
                  <option value="A5">A5 (4张眼片)</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">DPI:</label>
                <input
                  type="number"
                  value={dpi}
                  onChange={(e) => setDpi(Math.max(72, Math.min(1200, parseInt(e.target.value) || 300)))}
                  className="border rounded px-2 py-1 w-20"
                  min="72"
                  max="1200"
                />
              </div>
              {(leftImages.length > 0 || rightImages.length > 0) && (
                <>
                  <button
                    onClick={handlePrint}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    打印
                  </button>
                  <button
                    onClick={handleGeneratePNG}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    生成PNG
                  </button>
                </>
              )}
            </div>

            {/* 预览区域 */}
            <div className="flex gap-8">
              {/* 左眼预览 */}
              {leftImages.length > 0 && (
                <div className="flex-1">
                  <h2 className="font-medium mb-4">左眼图片</h2>
                  <div className="space-y-4">
                    {leftImages.map((img, index) => (
                      <div key={index} className="bg-white p-4 rounded shadow">
                        <div className="flex gap-4 mb-4">
                          <img src={img.url} alt={`左眼 ${index + 1}`} className="w-24 h-24 object-cover" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-2">左眼图片 {index + 1}</p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <label className="text-sm w-12">宽度:</label>
                                <input
                                  type="number"
                                  value={img.width}
                                  onChange={(e) => handleSizeChange('left', index, 'width', e.target.value)}
                                  className="w-20 px-2 py-1 border rounded text-sm"
                                  min="1"
                                  step="0.1"
                                />
                                <span className="text-sm text-gray-500">mm</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-sm w-12">高度:</label>
                                <input
                                  type="number"
                                  value={img.height}
                                  onChange={(e) => handleSizeChange('left', index, 'height', e.target.value)}
                                  className="w-20 px-2 py-1 border rounded text-sm"
                                  min="1"
                                  step="0.1"
                                />
                                <span className="text-sm text-gray-500">mm</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveImage('left', index)}
                            className="text-red-500 text-sm hover:text-red-600 self-start"
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
                  <h2 className="font-medium mb-4">右眼图片</h2>
                  <div className="space-y-4">
                    {rightImages.map((img, index) => (
                      <div key={index} className="bg-white p-4 rounded shadow">
                        <div className="flex gap-4 mb-4">
                          <img src={img.url} alt={`右眼 ${index + 1}`} className="w-24 h-24 object-cover" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-2">右眼图片 {index + 1}</p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <label className="text-sm w-12">宽度:</label>
                                <input
                                  type="number"
                                  value={img.width}
                                  onChange={(e) => handleSizeChange('right', index, 'width', e.target.value)}
                                  className="w-20 px-2 py-1 border rounded text-sm"
                                  min="1"
                                  step="0.1"
                                />
                                <span className="text-sm text-gray-500">mm</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-sm w-12">高度:</label>
                                <input
                                  type="number"
                                  value={img.height}
                                  onChange={(e) => handleSizeChange('right', index, 'height', e.target.value)}
                                  className="w-20 px-2 py-1 border rounded text-sm"
                                  min="1"
                                  step="0.1"
                                />
                                <span className="text-sm text-gray-500">mm</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveImage('right', index)}
                            className="text-red-500 text-sm hover:text-red-600 self-start"
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
        </div>

        {/* A4 预览区域 */}
        <div 
          ref={printAreaRef}
          className={`bg-white mx-auto shadow-lg p-4`} 
          style={{
            width: `${paperConfig.width}mm`,
            height: `${paperConfig.height}mm`
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
  )
}

export default App
