import test from 'ava'
import * as ImageHelper from '../../../../sub/helper/base/ImageHelper'

test('base64ToBlob', t => {
  const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAFiUAABYlAUlSJPAAAAAZSURBVChTY2RgYPgPxDgBE5TGCYaDAgYGAAxTAQ+7uUVuAAAAAElFTkSuQmCC'
  t.true(ImageHelper.base64ToBlob(base64)? true: false)
})
