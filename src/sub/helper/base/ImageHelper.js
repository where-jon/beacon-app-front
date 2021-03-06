/**
 * 画像に関するヘルパーモジュール
 * @module helper/base/ImageHelper
 */

import { APP } from '../../constant/config'
import * as BrowserUtil from '../../util/BrowserUtil'
import * as NumberUtil from '../../util/NumberUtil'
import * as StringUtil from '../../util/StringUtil'
import * as Util from '../../util/Util'
import * as HttpHelper from './HttpHelper'
import * as StateHelper from '../dataproc/StateHelper'

/**
 * 指定したエリア画像をロードする。指定しない場合は全てロードする。
 * @method
 * @async
 * @param {Number} areaId 
 */
export const loadImageArea = async (areaId) => {
  if (areaId) {
    await StateHelper.loadAreaImage(areaId, true)
  }
  else {
    await StateHelper.loadAreaImages()
  }
}

/**
 * 画像を読み込む。
 * @method
 * @param {Object} vueComponent 
 * @param {Event} e 
 * @param {String} imgViewName 
 * @param {String} imgWidthName 
 * @param {String} imgHeightName 
 * @param {String} thumbnailName 
 * @param {Number} resize 
 */
export const readImageView = (vueComponent, e, imgViewName, imgWidthName, imgHeightName, thumbnailName, resize) => {
  BrowserUtil.readImage(e, (evt, width, height, thumbnail) => {
    vueComponent.$refs[imgViewName].src = evt.target.result
    vueComponent.form[imgViewName] = evt.target.result
    if (imgWidthName) vueComponent.form[imgWidthName] = width
    if (imgHeightName) vueComponent.form[imgHeightName] = height
    if (thumbnailName) vueComponent.form[thumbnailName] = thumbnail

    if(vueComponent.checkSize){
      vueComponent.checkSize(width, height)
    }
  }, resize, size => {
    vueComponent.message = vueComponent.$i18n.tnl('message.uploadMax', {
      target: NumberUtil.trim(NumberUtil.floorVal(APP.MAX_IMAGE_SIZE / 1024 / 1024, 1))
    })
    vueComponent.replace({showAlert: true})
    if(vueComponent.onUploadError){
      vueComponent.onUploadError()
    }
    if (vueComponent.clearImage) {
      vueComponent.clearImage()
    }
    setTimeout(()=> {
      window.scrollTo(0, 0)
    }, 0)
  })
}

/**
 * 指定したURLに存在する画像に対してメソッドを実行する。指定したURLにデータが存在しない場合も実行する。
 * @method
 * @param {String} url
 * @param {Function} callback 実行するメソッド。引数は順に「result: Object」「isImage: Boolean」。
 */
export const getLogoData = async (url, callback) => {
  if(!await HttpHelper.existServerFile(url)){
    callback(null, false)
    return
  }
  BrowserUtil.toDataURL(url, result => {
    callback(result, /^data:image\/(png)|(jpg)|(jpeg)|(gif);base64,.*$/.test(result))
  })
}

/**
 * base64をblobに変換する。
 * @method
 * @param {Buffer} base64
 * @return {Blob}
 */
export const base64ToBlob = base64 => {
  const byteString = atob( base64.split( ',' )[1] )
  const mimeType = base64.match( /(:)([a-z/]+)(;)/ )[2]
  const byteLength = byteString.length
  const content = new Uint8Array(byteLength)
  for( let i = 0; i < byteLength; i++ ) {
    content[i] = byteString.charCodeAt(i)
  }
  return new Blob([content], {type: mimeType})
}

/**
 * パスの拡張子を参照し、画像ファイルかチェックする。
 * @method
 * @param {String} key パス
 * @return {Boolean}
 */
export const isImageFile = key => Util.hasValue(key) && /^.*\.(png$)|(jpg$)|(jpeg$)|(gif$)$/.test(key) && !/^.*(__MACOSX\/).*$/.test(key) && !/^\..*/.test(StringUtil.getFileName(key))

