import { tool } from "@opencode-ai/plugin"
import { writeFile, mkdir } from "node:fs/promises"
import { join } from "node:path"

export default tool({
  description: "使用 gpt-image-2 生成图片并保存到项目目录",
  args: {
    prompt: tool.schema.string().describe("图片描述 prompt"),
    filename: tool.schema.string().optional().describe("保存的文件名，如 landscape.png，默认用时间戳命名"),
    size: tool.schema.string().optional().describe("图片尺寸，如 1024x1024"),
  },
  async execute(args, context) {
    const res = await fetch("https://4router.net/v1/images/generations", {
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
    })

    const data = await res.json()

    if (!res.ok) {
      return `图片生成失败: ${JSON.stringify(data)}`
    }

    const b64 = data.data?.[0]?.b64_json
    if (!b64) {
      return `未获取到图片数据: ${JSON.stringify(data)}`
    }

    const dir = join(context.worktree, "generated-images")
    await mkdir(dir, { recursive: true })

    const name = args.filename || `image-${Date.now()}.png`
    const filepath = join(dir, name)
    await writeFile(filepath, Buffer.from(b64, "base64"))

    return `图片已生成并保存到 ${filepath}`
  },
})
