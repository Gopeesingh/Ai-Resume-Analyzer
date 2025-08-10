import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  // Use legacy build for better TypeScript + browser compatibility
  loadPromise = import("pdfjs-dist/legacy/build/pdf.mjs").then((lib: any) => {
    lib.GlobalWorkerOptions.workerSrc = pdfWorker;
    pdfjsLib = lib;
    return lib;
  });

  return loadPromise;
}

export async function convertPdfToImage(file: File): Promise<PdfConversionResult> {
  try {
    const lib = await loadPdfJs();

    if (!file || !(file instanceof File)) {
      return { imageUrl: "", file: null, error: "Invalid file provided" };
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    // Adjust scale for quality/performance
    const viewport = page.getViewport({ scale: 2 });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      return { imageUrl: "", file: null, error: "Canvas context is null" };
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    await page.render({ canvasContext: context, viewport }).promise;

    return new Promise((resolve) => {
      const createFileFromBlob = (blob: Blob) => {
        const originalName = file.name.replace(/\.pdf$/i, "");
        const imageFile = new File([blob], `${originalName}.png`, {
          type: "image/png",
        });

        resolve({
          imageUrl: URL.createObjectURL(blob),
          file: imageFile,
        });
      };

      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (blob) {
            createFileFromBlob(blob);
          } else {
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob",
            });
          }
        }, "image/png", 1.0);
      } else {
        // Safari fallback
        const dataUrl = canvas.toDataURL("image/png", 1.0);
        fetch(dataUrl)
          .then((res) => res.blob())
          .then((blob) => createFileFromBlob(blob))
          .catch((err) =>
            resolve({
              imageUrl: "",
              file: null,
              error: `Failed to create image: ${err}`,
            })
          );
      }
    });
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err}`,
    };
  }
}

