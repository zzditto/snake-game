import { tool } from "@opencode-ai/plugin"
import { writeFile, mkdir } from "node:fs/promises"
import { join, basename, extname } from "node:path"

function sanitizeFilename(name: string): string {
  const base = basename(name) || `image-${Date.now()}.png`
  return extname(base) ? base : `${base}.png`
}

export default tool({
  description: "使用 gpt-image-2 生成图片并保存到项目目录",
  args: {
    prompt: tool.schema.string().describe("图片描述 prompt"),
    filename: tool.schema.string().optional().describe("保存的文件名，如 landscape.png，默认用时间戳命名"),
    size: tool.schema.string().optional().describe("图片尺寸，如 1024x1024"),
  },
  async execute(args, context) {
    let res: Response
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 120_000)

      res = await fetch("https://4router.net/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.IMAGE_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-image-2",
          prompt: args.prompt,
          size: args.size || "1024x1024",
          n: 1,
          response_format: "b64_json",
        }),
        signal: controller.signal,
      })

      clearTimeout(timer)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return `图片生成请求失败: ${msg}`
    }

    const data = await res.json().catch(() => null)

    if (!res.ok || !data) {
      const status = res.status
      const reason = data?.error?.message || res.statusText || "unknown"
      return `图片生成失败 [HTTP ${status}]: ${reason}`
    }

    const b64 = data.data?.[0]?.b64_json
    if (!b64) {
      return `未获取到图片数据，API 返回了空结果`
    }

    try {
      const dir = join(context.worktree, "generated-images")
      await mkdir(dir, { recursive: true })

      const name = args.filename
        ? sanitizeFilename(args.filename)
        : `image-${Date.now()}.png`
      const filepath = join(dir, name)
      await writeFile(filepath, Buffer.from(b64, "base64"))

      return `图片已生成并保存到 ${filepath}`
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return `图片写入失败: ${msg}`
    }
  },
})
