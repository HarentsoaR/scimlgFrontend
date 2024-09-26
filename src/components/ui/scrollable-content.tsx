import { ScrollArea } from "./custom-scrollbar"

export default function ScrollableContent() {
  return (
    <div className="w-full max-w-md mx-auto p-4">
      <ScrollArea className="h-[300px] w-full rounded-md border p-4">
        <div className="space-y-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="h-16 w-full rounded-md bg-muted flex items-center justify-center">
              Item {i + 1}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}