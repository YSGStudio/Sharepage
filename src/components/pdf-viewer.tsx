"use client";

import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { loadPdfjs, PDFJS_ASSET_OPTIONS } from "@/lib/pdfjs";

/**
 * PDF 를 페이지 위 작은 창(모달)으로 보여 준다.
 *
 * 목록의 카드마다 창을 두지 않도록, 여는 버튼(PdfOpenButton)은 이벤트만 보내고
 * 페이지에 하나 둔 PdfViewerHost 가 창을 띄운다.
 * 브라우저 내장 PDF 뷰어는 휴대폰(특히 iOS)에서 첫 쪽만 보이는 등 제각각이라
 * pdf.js 로 직접 그린다. 화면 가까이 온 쪽만 그리고, 파일도 필요한 부분만 받는다.
 */

export interface PdfViewerTarget {
  url: string;
  title: string;
  fileName: string;
}

const OPEN_EVENT = "pdf-viewer:open";

export function PdfOpenButton({
  children,
  className,
  ariaLabel,
  ...target
}: PdfViewerTarget & { children: ReactNode; className?: string; ariaLabel?: string }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={className}
      onClick={() =>
        window.dispatchEvent(new CustomEvent<PdfViewerTarget>(OPEN_EVENT, { detail: target }))
      }
    >
      {children}
    </button>
  );
}

export function PdfViewerHost() {
  const [target, setTarget] = useState<PdfViewerTarget | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onOpen = (event: Event) => setTarget((event as CustomEvent<PdfViewerTarget>).detail);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  // 창 열기·닫기는 target 하나로만 정한다. 닫는 길(Esc·바깥·닫기 버튼)은 모두 close() 를 부른다.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (target && !dialog.open) dialog.showModal();
    if (!target && dialog.open) dialog.close();
  }, [target]);

  // 창이 떠 있는 동안 뒤 페이지가 함께 스크롤되지 않게 한다.
  const isOpen = target !== null;
  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [isOpen]);

  const close = () => setTarget(null);

  return (
    <dialog
      ref={dialogRef}
      aria-label={target ? `${target.title} 보기` : "PDF 보기"}
      onCancel={(event) => {
        // Esc: 브라우저가 직접 닫게 두지 않고 상태로 닫는다.
        event.preventDefault();
        close();
      }}
      // 창 바깥(어두운 배경)을 누르면 닫는다.
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className="m-auto h-[min(90dvh,64rem)] w-[min(calc(100vw-1.5rem),56rem)] max-h-none max-w-none overflow-hidden rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-[2px]"
    >
      {target && (
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 border-b border-surface-variant px-4 py-3">
            <h2 className="min-w-0 flex-1 truncate text-sm font-bold text-brand-900 sm:text-base">
              {target.title}
            </h2>
            <a
              href={target.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 sm:inline-block"
            >
              새 창에서 열기
            </a>
            <a
              href={target.url}
              download={target.fileName}
              className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
            >
              내려받기
            </a>
            <button
              type="button"
              onClick={close}
              aria-label="닫기"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-surface-container-low hover:text-ink-900"
            >
              <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-none stroke-current stroke-2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          {/* key: 다른 소식지를 열면 문서를 처음부터 다시 읽는다. */}
          <PdfPages key={target.url} url={target.url} />
        </div>
      )}
    </dialog>
  );
}

type LoadState =
  | { status: "loading" }
  | { status: "ready"; doc: PDFDocumentProxy; ratio: number }
  | { status: "error" };

function PdfPages({ url }: { url: string }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let destroy: (() => Promise<void>) | null = null;

    (async () => {
      const pdfjs = await loadPdfjs();
      const task = pdfjs.getDocument({
        url,
        ...PDFJS_ASSET_OPTIONS,
        // 큰 소식지도 보이는 쪽만큼만 나눠 받는다.
        disableAutoFetch: true,
        rangeChunkSize: 1024 * 1024,
      });
      destroy = () => task.destroy();

      const doc = await task.promise;
      const first = (await doc.getPage(1)).getViewport({ scale: 1 });
      if (!cancelled) setState({ status: "ready", doc, ratio: first.width / first.height });
    })().catch((error) => {
      console.error("[pdf-viewer] PDF 를 열지 못했습니다:", error);
      if (!cancelled) setState({ status: "error" });
    });

    return () => {
      cancelled = true;
      void destroy?.();
    };
  }, [url]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain bg-surface-container-low">
      {state.status === "loading" && (
        <p className="p-10 text-center text-sm text-ink-500">PDF 를 불러오는 중입니다…</p>
      )}
      {state.status === "error" && (
        <div className="p-10 text-center text-sm text-ink-700">
          <p>이 창에서 PDF 를 보여 주지 못했습니다.</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block font-semibold text-brand-600 underline"
          >
            새 창에서 열기
          </a>
        </div>
      )}
      {state.status === "ready" && (
        <div className="mx-auto flex max-w-3xl flex-col gap-3 p-3 sm:gap-4 sm:p-5">
          {Array.from({ length: state.doc.numPages }, (_, i) => (
            <PdfPage
              key={i}
              doc={state.doc}
              pageNumber={i + 1}
              initialRatio={state.ratio}
              scrollRoot={scrollRef}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PdfPage({
  doc,
  pageNumber,
  initialRatio,
  scrollRoot,
}: {
  doc: PDFDocumentProxy;
  pageNumber: number;
  initialRatio: number;
  scrollRoot: React.RefObject<HTMLDivElement | null>;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ratio, setRatio] = useState(initialRatio);
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);

  // 화면 가까이 오면 한 번만 그린다.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { root: scrollRoot.current, rootMargin: "800px 0px" },
    );
    observer.observe(box);
    return () => observer.disconnect();
  }, [scrollRoot]);

  useEffect(() => {
    if (!visible) return;
    let task: RenderTask | null = null;
    let cancelled = false;

    (async () => {
      const page = await doc.getPage(pageNumber);
      const box = boxRef.current;
      const canvas = canvasRef.current;
      if (cancelled || !box || !canvas) return;

      const unscaled = page.getViewport({ scale: 1 });
      setRatio(unscaled.width / unscaled.height);
      // 선명하게 그리되, 고해상도 화면에서 캔버스가 지나치게 커지지 않도록 묶는다.
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = page.getViewport({
        scale: (box.clientWidth * pixelRatio) / unscaled.width,
      });
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      task = page.render({ canvas, viewport });
      await task.promise;
      if (!cancelled) setRendered(true);
    })().catch((error) => {
      if (!cancelled) console.error(`[pdf-viewer] ${pageNumber}쪽을 그리지 못했습니다:`, error);
    });

    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [visible, doc, pageNumber]);

  return (
    <div
      ref={boxRef}
      style={{ aspectRatio: ratio }}
      className="relative w-full overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-black/5"
    >
      <canvas
        ref={canvasRef}
        aria-label={`${pageNumber}쪽`}
        className="block h-full w-full"
      />
      {!rendered && (
        <span className="absolute inset-0 flex items-center justify-center text-xs text-ink-500">
          {pageNumber}쪽
        </span>
      )}
    </div>
  );
}
