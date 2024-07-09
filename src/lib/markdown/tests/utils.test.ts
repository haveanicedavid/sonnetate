import { describe, expect, test, vi } from 'vitest'

import { MdBlock, MdBlockWithId } from '../types'
import {
  assignIds,
  createTopicTree,
  getBlockType,
  getDescription,
  getHeadingLevel,
  getTopics,
  getTrees,
} from '../utils'

// Mock the id() function from InstantDB
vi.mock('@instantdb/react', () => ({
  id: vi
    .fn()
    .mockReturnValueOnce('id1')
    .mockReturnValueOnce('id2')
    .mockReturnValueOnce('id3')
    .mockReturnValueOnce('id4')
    .mockReturnValueOnce('id5'),
}))

test('getBlockType correctly identifies block types', () => {
  expect(getBlockType('# Heading')).toBe('heading')
  expect(getBlockType('## Subheading')).toBe('heading')
  expect(getBlockType('Regular paragraph')).toBe('paragraph')
  expect(getBlockType('- List item')).toBe('unordered-list')
  expect(getBlockType('* List item')).toBe('unordered-list')
  expect(getBlockType('1. Ordered item')).toBe('ordered-list')
  expect(getBlockType('- [ ] Todo item')).toBe('task-list')
  expect(getBlockType('- [x] Completed item')).toBe('task-list')
  expect(getBlockType('> Blockquote')).toBe('blockquote')
  expect(getBlockType('```javascript\ncode\n```')).toBe('codeblock')
  expect(getBlockType('![Alt text](image.jpg)')).toBe('image')
})

test('getHeadingLevel correctly identifies heading levels', () => {
  expect(getHeadingLevel('# Heading 1')).toBe(1)
  expect(getHeadingLevel('## Heading 2')).toBe(2)
  expect(getHeadingLevel('### Heading 3')).toBe(3)
  expect(getHeadingLevel('#### Heading 4')).toBe(4)
  expect(getHeadingLevel('##### Heading 5')).toBe(5)
  expect(getHeadingLevel('###### Heading 6')).toBe(6)
  // fails
  expect(getHeadingLevel('######7 not Heading 7')).toBe(0)
  expect(getHeadingLevel('not a header')).toBe(0)
  expect(getHeadingLevel('#not-a-header')).toBe(0)
})

describe('getDescription', () => {
  test('extracts content under the first header', () => {
    const markdown = `# Heading

paragraph describing
more description

## Another heading
This should not be included`

    expect(getDescription(markdown)).toBe(
      'paragraph describing\nmore description'
    )
  })

  test('returns empty string if no content after header', () => {
    const markdown = `# Heading

## Another heading
Content under second heading`

    expect(getDescription(markdown)).toBe('')
  })

  test('returns empty string if no headers', () => {
    const markdown = `This is just a paragraph
without any headers`

    expect(getDescription(markdown)).toBe('')
  })

  test('handles markdown with only one header', () => {
    const markdown = `# Single Heading
This is the only content`

    expect(getDescription(markdown)).toBe('This is the only content')
  })
})

describe('getTrees', () => {
  test('returns unique lowercase trees from parsed markdown', () => {
    const parsedMd: MdBlock[] = [
      {
        text: '# [[Header 1]]',
        type: 'heading',
        tree: '',
        children: [
          {
            text: 'Paragraph 1',
            type: 'paragraph',
            tree: 'Header 1',
            children: [],
            order: 0,
          },
          {
            text: '## [[Header 1/Header 2|Header 2]]',
            type: 'heading',
            tree: 'Header 1',
            children: [
              {
                text: 'Paragraph 2',
                type: 'paragraph',
                tree: 'Header 1/Header 2',
                children: [],
                order: 0,
              },
            ],
            order: 1,
          },
        ],
        order: 0,
      },
    ]

    const result = getTrees(parsedMd)
    expect(result).toEqual(['Header 1', 'Header 1/Header 2'])
  })

  test('returns empty array for markdown with no trees', () => {
    const parsedMd: MdBlock[] = [
      {
        text: 'Just a paragraph',
        type: 'paragraph',
        tree: '',
        children: [],
        order: 0,
      },
    ]

    const result = getTrees(parsedMd)
    expect(result).toEqual([])
  })

  test('handles nested structures correctly and converts to lowercase', () => {
    const parsedMd: MdBlock[] = [
      {
        text: '# [[Header 1]]',
        type: 'heading',
        tree: '',
        children: [
          {
            text: '## [[Header 1/Header 2|Header 2]]',
            type: 'heading',
            tree: 'Header 1',
            children: [
              {
                text: '### [[Header 1/Header 2/HEADER 3|HEADER 3]]',
                type: 'heading',
                tree: 'Header 1/Header 2',
                children: [
                  {
                    text: 'Deep paragraph',
                    type: 'paragraph',
                    tree: 'Header 1/Header 2/HEADER 3',
                    children: [],
                    order: 0,
                  },
                ],
                order: 0,
              },
            ],
            order: 0,
          },
        ],
        order: 0,
      },
    ]

    const result = getTrees(parsedMd)
    expect(result).toEqual([
      'Header 1',
      'Header 1/Header 2',
      'Header 1/Header 2/HEADER 3',
    ])
  })
})

describe('getTopics', () => {
  test('returns unique topics from an array of paths', () => {
    const paths = [
      'Topic 1/topic 2/topic 3',
      'Topic 1/another topic',
      'Different topic/topic 3',
      'Topic 1/Topic 1/nested topic',
    ]

    const result = getTopics(paths)

    expect(result).toEqual([
      'Different topic',
      'Topic 1',
      'another topic',
      'nested topic',
      'topic 2',
      'topic 3',
    ])
  })

  test('handles empty input', () => {
    expect(getTopics([])).toEqual([])
  })

  test('handles single-level topics', () => {
    const paths = ['Topic A', 'Topic B', 'Topic C']
    expect(getTopics(paths)).toEqual(['Topic A', 'Topic B', 'Topic C'])
  })
})

describe('createTopicTree', () => {
  test('creates correct tree structure from list of trees with arbitrary depth', () => {
    const trees = [
      'Topic 1/topic 2/topic 3/topic 4/topic 5',
      'Topic 1/another topic',
      'Different topic/topic 3',
      'Topic 1/Topic 2',
      'Very/Deep/Nested/Structure/With/Many/Levels',
    ]

    const result = createTopicTree(trees)

    expect(result).toEqual([
      {
        label: 'Topic 1',
        children: [
          {
            label: 'topic 2',
            children: [
              {
                label: 'topic 3',
                children: [
                  {
                    label: 'topic 4',
                    children: [{ label: 'topic 5', children: [] }],
                  },
                ],
              },
            ],
          },
          { label: 'another topic', children: [] },
          { label: 'Topic 2', children: [] },
        ],
      },
      {
        label: 'Different topic',
        children: [{ label: 'topic 3', children: [] }],
      },
      {
        label: 'Very',
        children: [
          {
            label: 'Deep',
            children: [
              {
                label: 'Nested',
                children: [
                  {
                    label: 'Structure',
                    children: [
                      {
                        label: 'With',
                        children: [
                          {
                            label: 'Many',
                            children: [{ label: 'Levels', children: [] }],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ])
  })

  test('handles empty input', () => {
    expect(createTopicTree([])).toEqual([])
  })

  test('handles single-level topics', () => {
    const trees = ['Topic A', 'Topic B', 'Topic C']
    expect(createTopicTree(trees)).toEqual([
      { label: 'Topic A', children: [] },
      { label: 'Topic B', children: [] },
      { label: 'Topic C', children: [] },
    ])
  })

  test('trims whitespace from topics', () => {
    const trees = ['  Spaced Topic  /  Nested Spaced  ']
    expect(createTopicTree(trees)).toEqual([
      {
        label: 'Spaced Topic',
        children: [{ label: 'Nested Spaced', children: [] }],
      },
    ])
  })
})

describe('assignIds', () => {
  test('assigns unique ids and parentIds to all blocks and their children', () => {
    const inputBlocks: MdBlock[] = [
      {
        text: '# Header 1',
        type: 'heading',
        tree: '',
        children: [
          {
            text: 'Paragraph 1',
            type: 'paragraph',
            tree: 'Header 1',
            children: [],
            order: 0,
          },
          {
            text: '## Subheader',
            type: 'heading',
            tree: 'Header 1',
            children: [
              {
                text: 'Paragraph 2',
                type: 'paragraph',
                tree: 'Header 1/Subheader',
                children: [],
                order: 0,
              },
            ],
            order: 1,
          },
        ],
        order: 0,
      },
    ]

    const result = assignIds(inputBlocks)

    const expectedOutput: MdBlockWithId[] = [
      {
        id: 'id1',
        parentId: null,
        text: '# Header 1',
        type: 'heading',
        tree: '',
        children: [
          {
            id: 'id2',
            parentId: 'id1',
            text: 'Paragraph 1',
            type: 'paragraph',
            tree: 'Header 1',
            children: [],
            order: 0,
          },
          {
            id: 'id3',
            parentId: 'id1',
            text: '## Subheader',
            type: 'heading',
            tree: 'Header 1',
            children: [
              {
                id: 'id4',
                parentId: 'id3',
                text: 'Paragraph 2',
                type: 'paragraph',
                tree: 'Header 1/Subheader',
                children: [],
                order: 0,
              },
            ],
            order: 1,
          },
        ],
        order: 0,
      },
    ]

    expect(result).toEqual(expectedOutput)
  })

  test('handles empty input', () => {
    expect(assignIds([])).toEqual([])
  })
})