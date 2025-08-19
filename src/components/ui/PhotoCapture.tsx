import React, { useRef, useState, useCallback, useEffect } from "react";
import { Camera, Upload, X, RotateCcw, Check } from "lucide-react";
import { Button } from "./Button";
import { Modal } from "./Modal";

interface PhotoCaptureProps {
  currentPhoto?: string | File | null;
  onPhotoChange: (file: File | null, photoUrl: string | null) => void;
  className?: string;
  disabled?: boolean;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  currentPhoto,
  onPhotoChange,
  className = "",
  disabled,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isModalOpen && isCameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
      };
    }
  }, [isModalOpen, isCameraActive, stream]);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1000 },
          height: { ideal: 1000 },
          facingMode: "user",
        },
        audio: false,
      });

      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (error) {
      console.error("Erro ao acessar a câmera:", error);
      alert("Não foi possível acessar a câmera. Verifique as permissões.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
    setCapturedPhoto(null);
    setCapturedFile(null);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        context.save();
        context.scale(-1, 1);
        context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        context.restore();

        const photoDataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedPhoto(photoDataUrl);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const fileName = `captured_photo_${Date.now()}.jpg`;
              const file = new File([blob], fileName, { type: "image/jpeg" });
              setCapturedFile(file);
            }
          },
          "image/jpeg",
          0.8
        );
      }
    }
  }, []);

  const savePhoto = useCallback(async () => {
    if (capturedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoUrl = reader.result as string;
        onPhotoChange(capturedFile, photoUrl);
        stopCamera();
        setIsModalOpen(false);
      };
      reader.readAsDataURL(capturedFile);
    } else {
      // Caso não haja arquivo, apenas feche o modal
      onPhotoChange(null, null);
      stopCamera();
      setIsModalOpen(false);
    }

    if (capturedPhoto && capturedFile) {
      onPhotoChange(capturedFile, capturedPhoto);
      stopCamera();
      setIsModalOpen(false);
    }
  }, [capturedPhoto, capturedFile, onPhotoChange, stopCamera]);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          onPhotoChange(file, result);
          setIsModalOpen(false);
        };
        reader.readAsDataURL(file);
      }
    },
    [onPhotoChange]
  );

  const openModal = () => {
    setIsModalOpen(true);
    setCapturedPhoto(null);
    setCapturedFile(null);
  };

  const closeModal = () => {
    stopCamera();
    setIsModalOpen(false);
  };

  const getImageUrl = () => {
    if (typeof currentPhoto === "string") {
      return currentPhoto.startsWith("data:")
        ? currentPhoto
        : `${import.meta.env.VITE_API_URL}/uploads/${currentPhoto}`;
    }

    if (currentPhoto instanceof File) {
      return URL.createObjectURL(currentPhoto);
    }

    return null;
  };

  return (
    <>
      <div className={`flex items-center justify-center ${className}`}>
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
            {currentPhoto ? (
              <img
                src={getImageUrl() ?? undefined}
                alt="Foto atual"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <Camera className="w-8 h-8 text-white" />
            )}
          </div>
          {!disabled && (
            <button
              onClick={openModal}
              className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
              title="Capturar nova foto"
            >
              <Camera className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Capturar Foto"
        size="lg"
      >
        <div className="space-y-4">
          {!isCameraActive && !capturedPhoto && (
            <div className="text-center space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={startCamera} icon={Camera} className="w-full">
                  Tirar Foto
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  icon={Upload}
                  variant="secondary"
                  className="w-full"
                >
                  Upload de Arquivo
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {isCameraActive && !capturedPhoto && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-96 object-cover transform scale-x-[-1]"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex justify-center space-x-3">
                <Button onClick={capturePhoto} icon={Camera} size="lg">
                  Capturar
                </Button>
                <Button onClick={stopCamera} variant="secondary" icon={X}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {capturedPhoto && (
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={capturedPhoto}
                  alt="Foto capturada"
                  className="w-64 h-64 object-cover rounded-lg mx-auto"
                />
              </div>
              <div className="flex justify-center space-x-3">
                <Button onClick={savePhoto} icon={Check} variant="success">
                  Salvar Foto
                </Button>
                <Button
                  onClick={() => {
                    setCapturedPhoto(null);
                    setCapturedFile(null);
                    startCamera();
                  }}
                  variant="secondary"
                  icon={RotateCcw}
                >
                  Tirar Novamente
                </Button>
                <Button onClick={stopCamera} variant="secondary" icon={X}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
