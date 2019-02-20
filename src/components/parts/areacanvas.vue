<template>
  <div id="stage" />
</template>

<script>
import {ZONE} from '../../sub/constant/Constants'
import Konva from 'konva'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'

class Zone {
  constructor(prop) {
    this._areaId = prop.areaId
    this.id = prop.id ? prop.id : -1
    this.categoryId = prop.categoryId ? prop.categoryId : -1
    this.name = prop.name
    this.text = null
    this.startX = prop.startX
    this.startY = prop.startY
    this.stage = prop.stage
    this.rectLayer = new Konva.Layer()
    this.stage.add(this.rectLayer)
    const size = this.stage.size()
    this.parentWidth = size.width
    this.parentHeight = size.height
    const anchorColor = '#b4b4b4'
    this.tr = new Konva.Transformer({
      anchorStroke: anchorColor,
      anchorFill: 'white',
      anchorSize: 10,
      borderStroke: anchorColor,
      borderDash: [3, 3],
      rotateEnabled: false,
      boundBoxFunc: (oldBoundBox, newBoundBox) => {
        // 左方向に伸長した場合
        newBoundBox.x = Math.max(0, newBoundBox.x)
        if (newBoundBox.x === 0) {
          newBoundBox.width = oldBoundBox.width
        }
        // 上方向に伸長した場合
        newBoundBox.y = Math.max(0, newBoundBox.y)
        if (newBoundBox.y === 0) {
          newBoundBox.height = oldBoundBox.height
        }
        // 右方向に伸長した場合
        newBoundBox.width = Math.max(Math.min(this.parentWidth - newBoundBox.x, newBoundBox.width), ZONE.MIN_WIDTH)
        // 下方向に伸長した場合
        newBoundBox.height = Math.max(Math.min(this.parentHeight - newBoundBox.y, newBoundBox.height), ZONE.MIN_HEIGHT)
        return newBoundBox
      }
    })
    this.tr.on('mouseup', (e) => { e.evt.stopImmediatePropagation() })
    this.tr.on('mousedown', (e) => {e.evt.stopImmediatePropagation()})
    this.tr.on('mousemove', (e) => { e.evt.stopImmediatePropagation() })
    this._isActive = false
    this.group = null
  }

  drawingRect(x, y) {
    const w = x - this.startX
    const h = y - this.startY
    this.rectLayer.removeChildren()
    this.group = new Konva.Group({
      x: this.startX,
      y: this.startY,
      width: w,
      height: h,
      draggable: true,
      dragBoundFunc: (pos) => {
        const group = this.group
        return {
          x: Math.max(0, Math.min(this.parentWidth - group.scaleX() * group.width() , pos.x)),
          y: Math.max(0, Math.min(this.parentHeight - group.scaleY() * group.height(), pos.y))
        }
      }
    })
    const rect = new Konva.Rect({
      width: w,
      height: h,
      strokeWidth: 1,
      fill: 'rgba(0, 0, 209, 0.5)',
      stroke : 'rgba(32, 16, 64)',
    })
    this.text = new Konva.Text({
      text: this.name,
      fontSize: 18,
      fontFamily: 'Calibri',
      fill: 'white',
      width: this.w,
      align: 'center'
    })
    this.group.add(rect)
    this.group.add(this.text)
    this.rectLayer.add(this.group)
    this.rectLayer.draw()
  }

  fix(mousedownListener) {
    if (!this.group) {
      return
    }
    this.rectLayer.add(this.tr)
    this.group.setListening(true)
    this.group.on('mousedown', (e) => {
      e.evt.stopImmediatePropagation()
      mousedownListener(this)
      this.active()
    })
    this.group.on('mouseup', (e) => { e.evt.stopImmediatePropagation() })
    this.group.on('mouseenter', () => { this.stage.container().style.cursor = 'move' })
    this.group.on('mouseleave', () => { this.stage.container().style.cursor = 'default' })
    this.group.on('transformend', (e) => { e.evt.stopImmediatePropagation() })
    this.active()
  }

  active() {
    if (!this.group) {
      return
    }
    this._isActive = true
    this.tr.attachTo(this.group)
    this.rectLayer.draw()
  }

  inactive() {
    this._isActive = false
    this.tr.detach()
    this.rectLayer.draw()
  }

  rename(name) {
    this.name = name
    this.text.setAttr('text', name)
    this.rectLayer.draw()
  }

  remove() {
    this._isActive = false
    this.stage.container().style.cursor = 'default'
    if (this.group) {
      this.group.off('mousedown')
      this.group.off('mouseup')
      this.group.off('mouseenter')
      this.group.off('mouseleave')
      this.group.off('transformend')
    }
    this.tr.off('mouseup')
    this.tr.off('mousedown')
    this.tr.off('mousemove')
    this.rectLayer.destroy()
    this.stage.draw()
    this.name = null
    this.startX = null
    this.startY = null
    this.stage = null
    this.rectLayer = null
    this.parentWidth = null
    this.parentHeight = null
  }

  get isActive() {
    return this._isActive
  }

  get areaId() {
    return this._areaId
  }

  get zoneType() {
    return ZONE.getTypes()[0].value
  }

  get zoneName() {
    return this.name
  }

  get zoneId() {
    return this.id
  }

  get x() {
    return this.group ? this.group.x() : -1
  }

  get y() {
    return this.group ? this.group.y() : -1
  }

  get w() {
    return this.group ? this.group.scaleX() * this.group.width() : 0
  }

  get h() {
    return this.group ? this.group.scaleY() * this.group.height() : 0
  }
}

class Zones {
  constructor() {
    this.zones = []
  }

  add(zone) {
    this.setInActive()
    zone.active()
    this.zones.push(zone)
  }

  setInActive() {
    const active = this.activeZone
    if (active) {
      active.inactive()
    }
  }

  setAllInActive() {
    this.zones.forEach((e) => e.inactive())
  }

  deleteSelectedZone() {
    const target = this.zones.find((e) => e.isActive)
    const id = target ? target.id : -1
    if (target) {
      target.remove()
    }
    this.zones = this.zones.filter((e) => e.name !== null)
    return id
  }

  clear() {
    this.zones = []
  }

  get activeZone() {
    return this.zones.find((e) => e.isActive)
  }

  get list() {
    return this.zones
  }

  get entities() {
    return this.zones.map((zone, index, array) => {
      return {
        zoneId: zone.id && zone.id > 0 ? zone.id : -1 * (index + 1),
        zoneName: zone.zoneName,
        zoneType: zone.zoneType,
        areaId: zone.areaId,
        x: zone.x,
        y: zone.y,
        w: zone.w,
        h: zone.h,
        zoneCategoryList: [{
          zoneCategoryPK: {
            zoneId: zone.zoneId,
            categoryId: zone.categoryId
          }
        }],
      }
    })
  }
}

export default {
  plugins: [Konva],
  props: {
    areaId: {
      default: -1,
      type: Number 
    },
    zoneName: {
      default: null,
      type: String
    },
    categoryId: {
      default: -1,
      type: Number
    },
    isRegist: {
      default: false,
      type: Boolean
    },
    isDelete: {
      default: false,
      type: Boolean
    },
    isCompleteRegist: {
      default: false,
      type: Boolean
    },
    auth: {
      default: () => {return {regist: true, update: true, delete: true}},
      type: Object,
    },
  },
  data () {
    return {
      stage: null,
      cnt: 0,
      dragging: false,
      zones: null,
      MINIMUM_SIZE: 50,
      MAP_WIDTH: 741,
      MAP_HEIGHT: 573,
    }
  },
  computed: {
    isEditable(){
      return this.auth.regist || this.auth.update || this.auth.delete
    }
  },
  watch: {
    areaId: function(newVal, oldVal) {
      this.onChangeAreaId(newVal)
    },
    categoryId: function(newVal, oldVal) {
      const activeZone = this.zones.activeZone
      if (!activeZone) return
      activeZone.categoryId = newVal
    },
    zoneName: function(newVal, oldVal) {
      const activeZone = this.zones.activeZone
      if (!activeZone) return
      const message = this.validateZoneName(activeZone.id, newVal)
      if (message) {
        this.$emit('validated', message)
        return
      }
      activeZone.rename(newVal)
    },
    isRegist: function(newVal, oldVal) {
      if (!newVal) return
      this.$emit('regist', this.zones.entities)
    },
    isDelete: function(newVal, oldVal) {
      if (!newVal) return
      this.$emit('deleted', this.zones.deleteSelectedZone())
    },
    isCompleteRegist: function(newVal, oldVal) {
      if (!newVal) return
      this.onChangeAreaId(this.areaId)
      this.$emit('reloaded')
    }
  },
  mounted () {
    const drawArea = document.getElementById('stage')
    this.stage = new Konva.Stage({
      container: 'stage',
      width: 0,
      height: 0
    })
    this.zones = new Zones()
    let zone = null

    drawArea.addEventListener('mousedown', (e) => {
      this.dragging = true
      this.zones.setAllInActive()
      this.$emit('unselected')
      zone = new Zone({
        areaId: this.areaId,
        name: `Zone${++this.cnt}`,
        categoryId: this.categoryId,
        startX: e.offsetX,
        startY: e.offsetY,
        stage: this.stage,
      })
    })

    drawArea.addEventListener('mousemove', (e) => {
      if (!this.dragging) return
      zone.drawingRect(e.offsetX, e.offsetY)
    })

    drawArea.addEventListener('mouseup', (e) => {
      this.dragging = false 
      zone.fix((fixedZone) => {
        this.dragging = false
        this.emitZone(fixedZone)
        this.zones.setInActive()
      })
      if (zone.w < this.MINIMUM_SIZE || zone.h < this.MINIMUM_SIZE) {
        zone.remove()
        --this.cnt
        return
      }
      this.zones.add(zone)
      this.emitZone(zone)
    })

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' && this.zones.activeZone ) {
        this.$emit('pressDelKey')
      }
    })
    this.setupCanvas(this.base64)
  },
  methods: {
    emitZone(zone) {
      this.$emit('selected', {
        id: zone.id,
        name: zone.name,
        top: zone.y,
        left: zone.x,
        width: zone.width,
        height: zone.height,
        categoryId: zone.categoryId,
      })
    },
    onChangeAreaId(areaId) {
      const areaImage = this.$store.state.app_service.areaImages.find((a) => { return a.areaId === areaId })
      const base64 = areaImage ? areaImage.mapImage : ''
      this.cnt = 0
      this.setupCanvas(base64)
    },
    setupCanvas (base64) {
      const stage = this.stage
      const img = new Image()
      img.onload = () => {
        stage.removeChildren()
        // const result = this.calcFitSize(img, document.getElementById('stage'))
        // img.width = result.width
        // img.height = result.height
        // マップのサイズはEXB配置設定のマップサイズと合わせてある。
        // マップサイズは統一すべき
        img.width = this.MAP_WIDTH
        img.height = this.MAP_HEIGHT
        stage.size({
          width: img.width,
          height: img.height
        })
        this.layer = new Konva.Layer()
        const konvaImg = new Konva.Image({
          x: 0,
          y: 0,
          image: img,
          width: img.width,
          height: img.height,
        })
        this.layer.add(konvaImg)
        stage.add(this.layer)
        this.addZones()
      }
      img.src = base64
    },
    validateZoneName(id, name) {
      const duprecated = this.zones.list.find((zone) => {
        return id !== zone.id && name === zone.name
      })
      return duprecated ? this.$i18n.tnl('message.duplicate', {key: this.$i18n.tnl('label.zoneName'), val: name}) : null
    },
    async addZones() {
      if (!this.areaId) {
        return
      }
      this.zones.clear()
      const zoneRecs = await AppServiceHelper.fetchList(`/core/zone/area/${this.areaId}`, 'id')
      this.cnt = zoneRecs.length > 0 ? Math.max(...zoneRecs.map((zoneRec) => zoneRec.zoneId)) + 1 : 0
      zoneRecs.forEach((zoneRec) => this.addZone(zoneRec))
      this.zones.setInActive()
    },
    addZone (zoneRec) {
      const zoneCategory = zoneRec.zoneCategoryList && zoneRec.zoneCategoryList.length > 0 ? zoneRec.zoneCategoryList[0] : null
      const categoryId = zoneCategory ? zoneCategory.zoneCategoryPK.categoryId : -1
      const zone = new Zone({
        id: zoneRec.zoneId,
        areaId: this.areaId,
        name: zoneRec.zoneName,
        categoryId: categoryId,
        startX: zoneRec.x,
        startY: zoneRec.y,
        stage: this.stage,
      })
      zone.drawingRect(zone.startX + zoneRec.w, zone.startY + zoneRec.h)
      zone.fix((fixedZone) => {
        this.dragging = false
        this.emitZone(fixedZone)
        this.zones.setInActive()
      })
      this.zones.add(zone)
    },
  }
}
</script>