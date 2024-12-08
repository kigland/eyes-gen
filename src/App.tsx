import { useState, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [images, setImages] = useState<{ left?: string; right?: string }>({})
  const leftEyeInputRef = useRef<HTMLInputElement>(null)
  const rightEyeInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (eye: 'left' | 'right', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || file.type !== 'image/png') return

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setImages(prev => ({
          ...prev,
          [eye]: e.target?.result as string
        }))
      }
    }
    reader.readAsDataURL(file)
  }

  const handlePrint = () => {
    window.print()
  }

  // 转换为数组以便渲染
  const imageArray = [images.left, images.right].filter(Boolean) as string[]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">PNG 图片排版工具</h1>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex gap-4">
                <button
                  onClick={() => leftEyeInputRef.current?.click()}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  选择左眼图片
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
                  选择右眼图片
                </button>
                <input
                  ref={rightEyeInputRef}
                  type="file"
                  accept="image/png"
                  onChange={(e) => handleImageUpload('right', e)}
                  className="hidden"
                />
              </div>
              {(images.left || images.right) && (
                <button
                  onClick={handlePrint}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  打印
                </button>
              )}
            </div>
            {/* 预览区域 */}
            {(images.left || images.right) && (
              <div className="flex gap-4">
                {images.left && (
                  <div className="bg-white p-4 rounded shadow">
                    <p className="font-medium mb-2">左眼</p>
                    <img src={images.left} alt="左眼" className="w-24 h-24 object-contain" />
                  </div>
                )}
                {images.right && (
                  <div className="bg-white p-4 rounded shadow">
                    <p className="font-medium mb-2">右眼</p>
                    <img src={images.right} alt="右眼" className="w-24 h-24 object-contain" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 空白的 A4 预览区域 */}
        <div className="bg-white w-[210mm] h-[297mm] mx-auto shadow-lg p-4">
          <div className="grid grid-cols-2 grid-rows-4 h-full gap-4">
            {Array(8).fill(null).map((_, index) => (
              <div key={index} className="border border-gray-200 flex items-center justify-center relative">
                {imageArray[index % imageArray.length] && (
                  <>
                    <img
                      src={imageArray[index % imageArray.length]}
                      alt={`${index % 2 === 0 ? '左眼' : '右眼'}`}
                      className="max-w-full max-h-full object-contain"
                    />
                    <span className="absolute top-2 left-2 text-sm text-gray-500">
                      {index % 2 === 0 ? '左眼' : '右眼'}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
