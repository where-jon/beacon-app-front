import { APP } from '../constant/config'
import * as HtmlUtil from '../util/HtmlUtil'
import * as StateHelper from '../helper/StateHelper'

export const loadImageArea = async (areaId) => {
  if (areaId) {
    await StateHelper.loadAreaImage(areaId, true)
  }
  else {
    await StateHelper.loadAreaImages()
  }
}

export const readImageView = (vueComponent, e, imgViewName, imgWidthName, imgHeightName, thumbnailName, resize) => {
  HtmlUtil.readImage(e, (evt, width, height, thumbnail) => {
    vueComponent.$refs[imgViewName].src = evt.target.result
    vueComponent.form[imgViewName] = evt.target.result
    if (imgWidthName) vueComponent.form[imgWidthName] = width
    if (imgHeightName) vueComponent.form[imgHeightName] = height
    if (thumbnailName) vueComponent.form[thumbnailName] = thumbnail
  }, resize, size => {
    vueComponent.message = vueComponent.$i18n.tnl('message.uploadMax', {target: Math.floor(APP.MAX_IMAGE_SIZE/1024/1024)})
    vueComponent.replace({showAlert: true})
    if (vueComponent.clearImage) {
      vueComponent.clearImage()
    }
    setTimeout(()=> {
      window.scrollTo(0, 0)
    }, 0)
  })
}
