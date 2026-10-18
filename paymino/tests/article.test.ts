import { describe, expect, it } from 'vitest'
import { parseArticle } from '../app/utils/article'

describe('parseArticle', () => {
  it('splits paragraphs, subheadings and lists', () => {
    const blocks = parseArticle('خط اول\nادامه\n\n## عنوان\n- یک\n- دو\n\nپایان')
    expect(blocks).toEqual([
      { type: 'paragraph', text: 'خط اول ادامه' },
      { type: 'heading', text: 'عنوان' },
      { type: 'list', items: ['یک', 'دو'] },
      { type: 'paragraph', text: 'پایان' },
    ])
  })

  it('keeps markup as plain text', () => {
    expect(parseArticle('<script>x</script>')).toEqual([{ type: 'paragraph', text: '<script>x</script>' }])
  })

  it('handles empty input and CRLF', () => {
    expect(parseArticle('')).toEqual([])
    expect(parseArticle('a\r\n\r\nb')).toHaveLength(2)
  })
})
