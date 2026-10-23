import Image from "next/image";
import { TaskPhotoEditor } from "@/components/task-photo-editor";
import {
  taskItemKey,
  type TaskExecution,
  type TaskExecutionItem,
} from "@/content/research";

/** 결과보고서 실행 항목 번호(가·나·다) */
const EXECUTION_LABELS = ["가", "나", "다", "라", "마"];

/**
 * 과제 실행 내용을 트리형 도식으로 보여준다.
 * 과제 → 가·나·다 실행 영역 → 세부 항목 → 운영 활동(칩) / 단계 흐름 순으로 내려간다.
 * 세부 항목마다 사진은 1장이며, 운영자가 바꾼 사진(photoOverrides)이 기본 사진보다 우선한다.
 */
export function TaskExecutionDiagram({
  taskId,
  root,
  executions,
  photoOverrides,
  editable,
}: {
  taskId: string;
  root: string;
  executions: TaskExecution[];
  /** 항목 키 → 운영자가 올린 사진 URL */
  photoOverrides: Record<string, string>;
  /** 운영자에게만 사진 변경 버튼을 보여 준다 */
  editable: boolean;
}) {
  return (
    <div>
      <div className="flex justify-center">
        <p className="rounded-full bg-brand-600 px-5 py-2 text-center text-sm font-bold text-white shadow-sm">
          {root}
        </p>
      </div>
      <div aria-hidden className="mx-auto h-5 w-px bg-brand-300" />

      <ol
        className={`grid gap-5 ${
          executions.length >= 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"
        }`}
      >
        {executions.map((execution, i) => (
          <li key={execution.title} className="relative flex flex-col lg:pt-5">
            {/* 루트에서 각 영역으로 갈라지는 연결선 (넓은 화면에서만). 가로선은 칸 사이 간격(gap-5)의 절반씩 이어 붙인다. */}
            <span
              aria-hidden
              className={`absolute top-0 hidden h-px bg-brand-300 lg:block ${
                i === 0 ? "left-1/2" : "-left-2.5"
              } ${i === executions.length - 1 ? "right-1/2" : "-right-2.5"}`}
            />
            <span
              aria-hidden
              className="absolute left-1/2 top-0 hidden h-5 w-px bg-brand-300 lg:block"
            />
            <div className="flex h-full flex-col overflow-hidden rounded-xl border border-brand-200 bg-white shadow-sm">
              <div className="flex items-start gap-3 bg-brand-50 px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-black text-white">
                  {EXECUTION_LABELS[i]}
                </span>
                <h3 className="pt-1 text-sm font-bold leading-snug text-brand-900">
                  {execution.title}
                </h3>
              </div>

              <ol className="flex flex-1 flex-col gap-3 p-4">
                {execution.items.map((item, j) => {
                  const itemKey = taskItemKey(taskId, i, j);
                  return (
                    <ExecutionItem
                      key={item.title}
                      item={item}
                      index={j}
                      itemKey={itemKey}
                      photo={photoOverrides[itemKey] ?? item.photo}
                      customized={itemKey in photoOverrides}
                      editable={editable}
                    />
                  );
                })}
              </ol>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ExecutionItem({
  item,
  index,
  itemKey,
  photo,
  customized,
  editable,
}: {
  item: TaskExecutionItem;
  index: number;
  itemKey: string;
  photo: string | undefined;
  customized: boolean;
  editable: boolean;
}) {
  return (
    <li className="rounded-lg border border-surface-variant bg-surface-container-low p-3">
      {photo && (
        <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-md border border-surface-variant bg-white">
          <Image
            src={photo}
            alt={`${item.title} 운영 사진`}
            fill
            sizes="(max-width: 1024px) 100vw, 320px"
            className="object-contain"
          />
        </div>
      )}
      <p className="flex items-start gap-2 text-sm font-semibold leading-snug text-ink-900">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand-100 text-xs font-bold text-brand-700">
          {index + 1}
        </span>
        {item.title}
      </p>

      {item.details &&
        (item.flow ? (
          <ol className="mt-3 space-y-1.5">
            {item.details.map((step, k) => (
              <li key={step} className="flex flex-col items-center gap-1.5">
                {k > 0 && (
                  <span aria-hidden className="text-xs leading-none text-brand-400">
                    ▼
                  </span>
                )}
                <span className="w-full rounded-md border border-brand-200 bg-white px-3 py-1.5 text-center text-xs font-semibold text-brand-800">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {item.details.map((detail) => (
              <li
                key={detail}
                className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-ink-700 ring-1 ring-surface-variant"
              >
                {detail}
              </li>
            ))}
          </ul>
        ))}

      {editable && <TaskPhotoEditor itemKey={itemKey} customized={customized} />}
    </li>
  );
}
