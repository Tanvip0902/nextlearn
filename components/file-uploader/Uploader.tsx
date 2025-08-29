"use client"

import { useCallback, useEffect, useState } from "react"
import { FileRejection, useDropzone } from "react-dropzone"
import { Card, CardContent } from "../ui/card"
import { cn } from "@/lib/utils"
import { RenderEmptyState, RenderErrorState, RenderUploadedState, RenderUploadingState } from "./RenderState"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import { useConstructUrl } from "@/hooks/use-construct-url"


interface UploaderState {
  id: string | null;
  file: File | null;
  uploading: boolean;
  progress: number;
  key?: string;
  isDeleting:boolean;
  error: boolean;
  objectUrl?: string;
  fileType: "image" | "video"
}


interface iAppProps {
  value?: string;
  onChange?: (value:string) => void;
  fileTypeAccepted: "image" | "video";
}

export const Uploader = ({value, onChange, fileTypeAccepted}: iAppProps) => {

 const fileUrl = useConstructUrl( value || "")

  const [fileState, setFileState] = useState<UploaderState>({                 // Estado para gestionar el ciclo de vida de la subida.
    error: false,
    file: null,
    id: null,
    uploading: false,
    progress: 0,
    isDeleting: false,
    fileType: fileTypeAccepted,
    key: value, // value del formulario = key del state del uploader
    objectUrl: value ? fileUrl : undefined,
  })

  const uploadFile = useCallback(async (file: File) => {                      

    setFileState((prev) => ({                                                
      ...prev,
      uploading: true,
      progress: 0,
    }))

    try {
      const presignedResponse = await fetch("/api/s3/upload",{                
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          isImage: fileTypeAccepted === "image" ? true : false,
        }),
      });

      if(!presignedResponse.ok){
        toast.error("Failed to generate presigned url");
        setFileState((prev) => ({
          ...prev,
          uploading: false,
          progress: 0,
          error: true,
        }));

        return;
      }

      const { presignedUrl, key } = await presignedResponse.json();           // la api responde con una clave única para el archivo y una url autorizada para una subida PUT

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();                                     // Sube el archivo directamente a S3 usando la URL firmada
        xhr.upload.onprogress = (event) => {                                  // Se usa XMLHttpRequest para poder escuchar los eventos de progreso
          if (event.lengthComputable) {                                       // Actualiza la barra de progreso en la UI.
            const percentageCompleted = (event.loaded / event.total) * 100;
            setFileState((prev) => ({
              ...prev,
              progress: Math.round(percentageCompleted)
            }));
          }
        }

        xhr.onload = () => {                                                  
          if(xhr.status === 200 || xhr.status === 204){
            setFileState((prev) => ({
              ...prev,
              uploading: false,
              progress: 100,
              key: key,    // Cuando se sube el archivo se genera un key único (aslkfjlsfkj-ñalskñslkf-image.png)
            }));

            onChange?.(key) // El key del state del uploader actualiza el valor del formulario

            toast.success("File uploaded successfully");

            resolve()
          
          }else{
            reject(new Error("Upload failed..."))
          }
        }

        xhr.onerror = () => {
          reject(new Error("Upload failed..."))
        };

        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

    } catch (error) {
      console.log("Error", error);
      toast.error("Something went wrong");
      setFileState((prev) => ({
        ...prev,
        progress: 0,
        error: true,
        uploading: false,
      }));
    }
  }, [fileTypeAccepted, onChange]);

  const onDrop = useCallback((acceptedFiles: File[]) => {                    // 1º Callback que se ejecuta cuando el usuario suelta un archivo en la zona.
    
    if(fileState.objectUrl && !fileState.objectUrl.startsWith("http")){      // Si el archivo ya está cargado en memoria, se descarga de la memoria.
      URL.revokeObjectURL(fileState.objectUrl);                              // De esta manera se evita que la memoria se sature con multiples archivos cargados.
    }

    if (acceptedFiles.length > 0) {                                          // Si hay un archivo seleccionado
      const file = acceptedFiles[0];
      setFileState({                                                         // Actualiza el estado del File a subir
        file: file,
        uploading: true,
        progress: 0,
        objectUrl: URL.createObjectURL(file),
        error: false,
        id: uuidv4(),
        isDeleting: false,
        fileType: fileTypeAccepted
      })

      uploadFile(file);                                                      // Inica el proceso de subida
    }
  }, [fileState.objectUrl, uploadFile, fileTypeAccepted]);

  const rejectedFiles = (fileRejection: FileRejection[]) => {                // Maneja los archivos que son rechazados por react-dropzone
    if(fileRejection.length) {
      const tooManyFiles = fileRejection.find(
        (rejection) => rejection.errors[0].code === "too-many-files")
    
      const fileSizeToBig = fileRejection.find(
        (rejection) => rejection.errors[0].code === "file-too-large"
      )

      if(fileSizeToBig){
        toast.error("File size is too large, max is 5MB")
      }

      if(tooManyFiles){
        toast.error("Too many files selected, max is 1")
      }
    }
  }

  const renderContent = () => {                                              // 3º Lógica de renderizado condicional basada en el estado de la subida.
    if(fileState.uploading ){
      return (
        <RenderUploadingState 
          progress={fileState.progress}
          file={fileState.file as File}
        />
      )
    }

    if(fileState.error){
      return <RenderErrorState />
    }

    if(fileState.objectUrl){
      return <RenderUploadedState 
        previewUrl={fileState.objectUrl} 
        handleRemoveFile={handleRemoveFile}
        isDeleting={fileState.isDeleting}  
        fileType={fileState.fileType} // Se establece al inicio del componente
      />
    }

    return <RenderEmptyState isDragActive={isDragActive} />
  }

  useEffect(() => {
    return () => {
      if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {      // Si el archivo ya está cargado en memoria, se descarga de la memoria.
        URL.revokeObjectURL(fileState.objectUrl);                                // De esta manera se evita que la memoria se sature con multiples archivos cargados.
      }
    }
  },[fileState.objectUrl]);

  const handleRemoveFile = async() => {
    if(fileState.isDeleting || !fileState.objectUrl) return 

      try {
        setFileState((prev) => ({
          ...prev,
          isDeleting: true
        }))

        const response = await fetch("/api/s3/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            key: fileState.key
          }),
        });

        if(!response.ok){
          toast.error("Failed to delete file");
          setFileState((prev) => ({
            ...prev,
            isDeleting: true,
            error: true,
          }))

          return;
        }

        if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {      // Si el archivo ya está cargado en memoria, se descarga de la memoria.
          URL.revokeObjectURL(fileState.objectUrl);                                // De esta manera se evita que la memoria se sature con multiples archivos cargados.
        }

        onChange?.("")

        setFileState((prev) => ({
          file: null,
          uploading:false,
          progress: 0,
          objectUrl: undefined,
          error: false,
          fileType: fileTypeAccepted,
          id: null,
          isDeleting: false,
        }));

        toast.success("File deleted successfully");

      } catch (error) {
        toast.error("Error deleting file, please try again");
        setFileState((prev) => ({
          ...prev,
          isDeleting: false,
          error: true,
        }));

      } 
    
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({        // Utiliza react-dropzone para manejar el arrastrar y soltar de archivos
     onDrop,                                                                 // Callback que se ejecuta cuando el usuario suelta un archivo en la zona.
     accept: fileTypeAccepted === "video" 
      ? {"video/*": []} 
      : {"image/*": []},       
     maxFiles: 1,
     multiple: false,
     maxSize: fileTypeAccepted === "image" ? 5*1024*1024 : 12*1024*1024,     // 5MB para imagenes y 10MB para videos
     onDropRejected: rejectedFiles,
     disabled: fileState.uploading || !!fileState.objectUrl
  })

  return (
    <Card 
      {...getRootProps()}
      className={cn(
        "relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full h-64",
        isDragActive 
          ? "border-primary bg-primary/10 border-solid"
          : "border-border hover:border-primary"
      )}  
    >
      <CardContent className="flex items-center justify-center w-full h-full p-4">
        <input {...getInputProps()} />
        {renderContent()}
      </CardContent>
    </Card>
  )
}