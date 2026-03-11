
import React, { useState, useCallback, useEffect } from 'react';
import { DetectionResult, DetectionLabel } from './types';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import { runInference } from './services/detectorService';
import { 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  Cpu,
  Database,
  User,
  Layers,
  Search,
  Scale,
  Code,
  FileText
} from 'lucide-react';

const App: React.FC = () => {
  const [currentResult, setCurrentResult] = useState<DetectionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processImage = async (input: File | string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await runInference(input);
      setCurrentResult(result);
    } catch (e: any) {
      setError("An error occurred during prediction. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    await processImage(files[0]);
  }, []);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) handleUpload([file]);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleUpload]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 pt-28 pb-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI-Imagery detection
          </h1>
          <p className="text-gray-600">Deepfake detection portal for image verification</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-sm">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-12">
          <div className="flex flex-col md:flex-row">
            {/* Upload Area */}
            <div className="md:w-1/2 p-6 bg-gray-100 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col items-center justify-center min-h-[400px]">
              {currentResult ? (
                <div className="text-center w-full">
                  <img 
                    src={currentResult.imageUrl} 
                    className="max-h-64 mx-auto rounded border border-gray-300 shadow-sm mb-4" 
                    alt="Uploaded" 
                  />
                  <button 
                    onClick={() => setCurrentResult(null)} 
                    className="flex items-center gap-2 mx-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> Reset
                  </button>
                </div>
              ) : (
                <FileUploader onUpload={handleUpload} isProcessing={isProcessing} />
              )}
            </div>

            {/* Results Area */}
            <div className="md:w-1/2 p-8 flex flex-col justify-center">
              {!currentResult && !isProcessing ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 italic">No image analyzed yet.</p>
                  <p className="text-sm text-gray-400 mt-2">Upload a file to see results.</p>
                </div>
              ) : isProcessing ? (
                <div className="text-center py-10">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="font-semibold text-blue-600">Analyzing image...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-bold text-gray-700 mb-4">Detection Results</h3>
                    
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Accuracy</span>
                      <span className="font-bold">{(currentResult.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${currentResult.label === DetectionLabel.FAKE ? 'bg-red-500' : 'bg-green-500'}`} 
                        style={{ width: `${currentResult.confidence * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">Threshold Applied: 0.50</p>
                  </div>

                  <div className={`p-4 rounded border-2 flex items-center gap-4 ${currentResult.label === DetectionLabel.FAKE ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                    {currentResult.label === DetectionLabel.FAKE ? <AlertCircle size={32} /> : <ShieldCheck size={32} />}
                    <div>
                      <span className="text-xs uppercase font-bold block opacity-70">Classification</span>
                      <span className="text-2xl font-black uppercase tracking-tight">{currentResult.label}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Detected Artifacts</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentResult.anomalies && currentResult.anomalies.length > 0 ? (
                        currentResult.anomalies.map((a, i) => (
                          <span key={i} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded border border-gray-200 font-medium">
                            {a}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400 italic">No obvious anomalies found.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Project Documentation */}
        <div className="border-t border-gray-200 pt-12 space-y-12">
          {/* Developer Section */}
          <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <User size={32} className="text-blue-600" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-gray-900">Developed by Arjun RV</h3>
              <p className="text-blue-600 font-semibold">3rd Year, Computer Science and Engineering (CSE)</p>
              <p className="text-gray-500">Meenakshi College of Engineering</p>
            </div>
          </section>

          {/* Technical Deep Dive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-bold flex items-center gap-2 text-gray-800">
                <Code size={18} className="text-blue-500" /> Core Technologies
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                The application is built on a robust stack including <strong>Python (PyTorch)</strong> for the AI engine, 
                <strong>FastAPI</strong> for backend communication, and <strong>React.js</strong> for the interactive frontend. 
                The <code>DeepfakeDetector</code> class leverages <strong>Hugging Face Transformers</strong> to manage 
                Vision Transformer weights and <strong>TorchVision</strong> for CNN feature extraction.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold flex items-center gap-2 text-gray-800">
                <Layers size={18} className="text-blue-500" /> How It Works
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                The detection logic follows a <strong>Hybrid Architecture</strong>. We use a <strong>ResNet-50</strong> backbone 
                to analyze local texture patterns (checkerboard artifacts, blurred pores) and a <strong>Vision Transformer (ViT)</strong> 
                to check for global consistency (lighting shadows, anatomical alignment).
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold flex items-center gap-2 text-gray-800">
                <Database size={18} className="text-blue-500" /> Datasets Used
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Our model is fine-tuned on benchmark datasets like <strong>FaceForensics++</strong>, <strong>Celeb-DF v2</strong>, 
                and the <strong>Deepfake Detection Challenge (DFDC)</strong>. These datasets provide a diverse range of 
                real and manipulated faces created using GANs and Diffusion models.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold flex items-center gap-2 text-gray-800">
                <Cpu size={18} className="text-blue-500" /> Model Training
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Training focuses on <strong>pixel-level digital fingerprinting</strong>. We employ binary cross-entropy 
                loss and data augmentation (gaussian noise, compression artifacts) to teach the model how to 
                distinguish between camera-captured noise and AI-generated smoothness.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold flex items-center gap-2 text-gray-800">
                <Search size={18} className="text-blue-500" /> Processing Pipeline
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Each input undergoes strict <strong>preprocessing</strong>: images are resized to <strong>224x224 pixels</strong>, 
                values are normalized to the <strong>[-1, 1] range</strong>, and a "warmup" inference pass ensures minimal 
                latency during the actual prediction phase.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold flex items-center gap-2 text-gray-800">
                <Scale size={18} className="text-blue-500" /> Detection Process
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                The detection process identifies "digital ghosts" in the frequency domain. By applying a 
                <strong>0.50 threshold</strong>, the system flags images where high-frequency textures deviate 
                significantly from natural distributions.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-12 px-4 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
          <div className="flex gap-4">
            <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-blue-100">AI-Buster v3.0</span>
            <span className="bg-gray-50 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-gray-100 underline decoration-dotted">Research Project</span>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-gray-900 font-bold text-sm">Arjun RV | Computer Science and Engineering</p>
            <p className="text-gray-500 text-xs">Meenakshi College of Engineering, Chennai</p>
            <p className="text-gray-400 text-[10px] italic pt-4 max-w-lg mx-auto leading-relaxed">
              This forensic portal is designed for research and educational purposes in the field of AI-Imagery detection and computer vision forensics. 
              The detection engine utilizes advanced neural network architectures to safeguard digital authenticity.
            </p>
          </div>
          
          <div className="flex items-center gap-1 text-gray-600 text-[10px] font-mono mt-4">
            <FileText size={10} /> <span>Classification Threshold: 0.50 | Preprocessing: 224x224 Norm</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
