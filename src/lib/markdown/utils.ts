import { id } from '@instantdb/react'

import { Block } from '@/db/types'

import type { FlatMdBlock, MdBlock, MdBlockType, MdBlockWithId } from './types'

export function getBlockType(text: string): MdBlockType {
  const firstLine = text.split('\n')[0]

  if (firstLine.startsWith('#')) return 'heading'
  if (firstLine.startsWith('- [ ] ') || firstLine.startsWith('- [x] '))
    return 'task-list'
  if (firstLine.startsWith('- ') || firstLine.startsWith('* '))
    return 'unordered-list'
  if (/^\d+\.\s/.test(firstLine)) return 'ordered-list'
  if (firstLine.startsWith('>')) return 'blockquote'
  if (firstLine.startsWith('```')) return 'codeblock'
  if (firstLine.startsWith('![')) return 'image'
  return 'paragraph'
}

export function getHeadingLevel(text: string): number {
  const match = text.match(/^(#{1,6})\s/)
  return match ? match[1].length : 0
}

export function getDescription(markdown: string): string {
  const lines = markdown.split('\n')
  const firstHeaderIndex = lines.findIndex((line) => line.startsWith('#'))

  if (firstHeaderIndex === -1 || firstHeaderIndex === lines.length - 1) {
    return ''
  }

  const contentAfterHeader = lines.slice(firstHeaderIndex + 1)
  const nextHeaderIndex = contentAfterHeader.findIndex((line) =>
    line.startsWith('#')
  )

  if (nextHeaderIndex === -1) {
    return contentAfterHeader.join('\n').trim()
  }

  return contentAfterHeader.slice(0, nextHeaderIndex).join('\n').trim()
}

export function getTrees(parsedMd: MdBlock[]): string[] {
  const trees = new Set<string>()

  function traverse(blocks: MdBlock[]) {
    for (const block of blocks) {
      if (block.tree !== '') {
        trees.add(block.tree)
      }
      traverse(block.children)
    }
  }

  traverse(parsedMd)
  return Array.from(trees).sort()
}

export function getTopics(paths: string[]): string[] {
  const topics = new Set<string>()

  for (const path of paths) {
    const parts = path.split('/')
    for (const part of parts) {
      topics.add(part.trim())
    }
  }

  return Array.from(topics).sort()
}

interface TreeNode {
  label: string
  children: TreeNode[]
}

export function createTopicTree(trees: string[]): TreeNode[] {
  const root: TreeNode[] = []

  for (const tree of trees) {
    const parts = tree.split('/').map((part) => part.trim())
    let currentLevel = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      let existingNode = currentLevel.find((node) => node.label === part)

      if (!existingNode) {
        existingNode = { label: part, children: [] }
        currentLevel.push(existingNode)
      }

      if (i < parts.length - 1) {
        currentLevel = existingNode.children
      }
    }
  }

  return root
}

export interface FlatTreeNode {
  label: string
  parent: string | null
}

export function flattenTopicTree(tree: TreeNode[]): FlatTreeNode[] {
  const flatNodes: FlatTreeNode[] = []

  function flatten(node: TreeNode, parent: string | null) {
    flatNodes.push({ label: node.label, parent })

    for (const child of node.children) {
      flatten(child, node.label)
    }
  }

  for (const node of tree) {
    flatten(node, null)
  }

  return flatNodes
}

export function assignIds(blocks: MdBlock[]): MdBlockWithId[] {
  function assignIdRecursively(
    block: MdBlock,
    parentId: string | null
  ): MdBlockWithId {
    const newId = id()
    const blockWithId: MdBlockWithId = {
      ...block,
      id: newId,
      parentId,
      children: block.children.map((child) =>
        assignIdRecursively(child, newId)
      ),
    }
    return blockWithId
  }

  return blocks.map((block) => assignIdRecursively(block, null))
}

export function flattenMdBlocks(blocks: MdBlockWithId[]): FlatMdBlock[] {
  const flatBlocks: FlatMdBlock[] = []

  function flatten(block: MdBlockWithId) {
    const { children, ...flatBlock } = block
    flatBlocks.push(flatBlock)

    for (const child of children) {
      flatten(child)
    }
  }

  for (const block of blocks) {
    flatten(block)
  }

  return flatBlocks
}

export function createMarkdownFromBlocks(
  rootBlock: MdBlock | MdBlockWithId | Block
): string {
  function buildMarkdown(block: MdBlock | MdBlockWithId | Block): string {
    let markdown = block?.text || ''

    if (block.children?.length > 0) {
      const sortedChildren = [...block.children].sort(
        (a, b) => a.order - b.order
      )

      for (const child of sortedChildren) {
        markdown += '\n\n' + buildMarkdown(child)
      }
    }

    return markdown
  }

  return buildMarkdown(rootBlock).trim()
}
