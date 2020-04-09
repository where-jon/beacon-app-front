<template>
  <div id="stage" class="stage" />
</template>

<script>
import Konva from 'konva'
import { ZONE, PATTERN } from '../../sub/constant/Constants'
import * as Util from '../../sub/util/Util'
import * as AppServiceHelper from '../../sub/helper/dataproc/AppServiceHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as MasterHelper from '../../sub/helper/domain/MasterHelper'

class Zone {
  constructor(prop) {
    this._areaId = prop.areaId
    this.id = prop.id ? prop.id : -1
    this.categoryId = prop.categoryId ? prop.categoryId : -1
    this.cd = prop.cd
    this.name = prop.name
    this.startX = prop.startX
    this.startY = prop.startY
    this.stage = prop.stage
    this.text = null
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
    if (!this.rectLayer) {
      return
    }
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
          x: Math.max(0, Math.min(this.parentWidth - group.scaleX() * group.width(), pos.x)),
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

    const textAttr = {
      text: this.name,
      fontSize: 18,
      fontFamily: 'Calibri',
      fill: 'white',
      width: Math.abs(this.w),
      align: 'center'
    }

    if (w < 0) {
      textAttr.x = w
    }

    if (h < 0) {
      textAttr.y = h
    }

    this.text = new Konva.Text(textAttr)
    this.group.add(rect)
    this.group.add(this.text)
    this.rectLayer.add(this.group)
    this.rectLayer.draw()
  }

  fix(mousedownListener, mouseupListener) {
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
    this.group.on('mouseup', (e) => {
      mouseupListener()
      e.evt.stopImmediatePropagation()
    })
    const container = this.stage.container()
    this.group.on('mouseenter', () => { container.style.cursor = 'move' })
    this.group.on('mouseleave', () => { container.style.cursor = 'default' })
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
    return ZONE.COORDINATE
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

  getEntities(aspectRatio) {
    return this.zones.map((zone, index, array) => {
      const width = zone.w
      const height = zone.h
      const x = width > -1 ? zone.x : zone.x + width
      const y = height > -1 ? zone.y : zone.y + height
      return {
        zoneId: zone.id && zone.id > 0 ? zone.id : -1 * (index + 1),
        zoneCd: zone.cd,
        zoneCdName: PATTERN.REGEXP.MASTER_CD.test(zone.cd)? null: zone.cd,
        zoneName: zone.zoneName,
        zoneType: zone.zoneType,
        areaId: zone.areaId,
        x: x / aspectRatio,
        y: y / aspectRatio,
        w: Math.abs(width) / aspectRatio,
        h: Math.abs(height) / aspectRatio,
        zoneCategoryList: zone.categoryId > 0 ? [{
          zoneCategoryPK: {
            zoneId: zone.zoneId,
            categoryId: zone.categoryId
          }
        }] : [],
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
    zoneCd: {
      default: null,
      type: String
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
      dragging: false,
      zones: null,
      aspectRatio: 1,
      MINIMUM_SIZE: 50,
      MAP_WIDTH: 741,
      MAP_HEIGHT: 573,
      drawingZone: null,
      zoneFixMouseDown: null,
      drawAreaMouseUp: null,
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
    zoneCd: function(newVal, oldVal) {
      const activeZone = this.zones.activeZone
      if (!activeZone) return
      activeZone.cd = newVal
    },
    zoneName: function(newVal, oldVal) {
      const activeZone = this.zones.activeZone
      if (!activeZone) return
      activeZone.rename(newVal)
    },
    isRegist: function(newVal, oldVal) {
      if (!newVal) return
      this.$emit('regist', this.zones.getEntities(this.aspectRatio))
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

    drawArea.addEventListener('mousedown', (e) => {
      this.dragging = true
      this.zones.setAllInActive()
      this.$emit('unselected')
      this.drawingZone = new Zone({
        areaId: this.areaId,
        cd: this.getNewZoneCd(),
        name: this.getNewZoneName(),
        categoryId: this.categoryId,
        startX: e.offsetX,
        startY: e.offsetY,
        stage: this.stage,
      })
    })

    drawArea.addEventListener('mousemove', (e) => {
      if (!this.dragging) return
      this.drawingZone.drawingRect(e.offsetX, e.offsetY)
    })

    this.zoneFixMouseDown = (fixedZone) => {
      this.dragging = false
      this.emitZone(fixedZone)
      this.zones.setInActive()
    }

    this.drawAreaMouseUp = (e) => {
      if (!this.drawingZone) {
        return
      }
      if (!this.drawingZone.rectLayer) {
        this.dragging = false
        return
      }
      this.drawingZone.fix(this.zoneFixMouseDown, this.drawAreaMouseUp)
      if (Math.abs(this.drawingZone.w) < this.MINIMUM_SIZE || Math.abs(this.drawingZone.h) < this.MINIMUM_SIZE) {
        this.drawingZone.remove()
        return
      }
      this.zones.add(this.drawingZone)
      this.emitZone(this.drawingZone)
      this.dragging = false 
      this.drawingZone = null
    }

    drawArea.addEventListener('mouseup', this.drawAreaMouseUp)

    window.addEventListener('keydown', (e) => {
      const className = e.target.className
      if (className && className.length > 0) {
        return
      }
      if (e.key === 'Delete' && this.zones.activeZone ) {
        this.$emit('pressDelKey')
      }
    })
  },
  methods: {
    getNewZoneCd(){
      const zones = this.$store.state.app_service.zones
      const dispZones = zones.concat(this.zones.list.map(zone => ({zoneCd: zone.cd})))
      return MasterHelper.createMasterCd('zone', dispZones)
    },
    getNewZoneName(){
      if(!this.zones){
        return 'Zone1'
      }
      const list = !Util.hasValue(this.zones.list)? []: this.zones.list.filter(zone => /^Zone[0-9]*/.test(zone.zoneName)).map(zone => ({zoneCd: zone.zoneName}))
      if(!Util.hasValue(list)){
        return 'Zone1'
      }
      return MasterHelper.createMasterCd('zone', list)
    },
    emitZone(zone) {
      this.$emit('selected', {
        id: zone.id,
        cd: zone.cd,
        name: zone.name,
        top: zone.y,
        left: zone.x,
        width: zone.width,
        height: zone.height,
        categoryId: zone.categoryId,
      })
    },
    async onChangeAreaId(areaId) {
      const areaImage = await StateHelper.loadAreaImage(areaId, false)
      if (areaImage) {
        this.setupCanvas(areaImage)
      }
    },
    setupCanvas (mapImage) {
      const stage = this.stage
      const img = new Image()
      img.onload = () => {
        stage.removeChildren()
        // マップのサイズはEXB配置設定のマップサイズと合わせてある。
        // マップサイズは統一すべき
        this.aspectRatio = this.MAP_WIDTH / img.width
        img.width = this.MAP_WIDTH
        img.height *= this.aspectRatio
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
      img.src = mapImage
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
      let zoneRecs = await AppServiceHelper.fetchList(`/core/zone/area/${this.areaId}`, 'id') // TODO: APIで使用していない項目があるため整理
      zoneRecs = _.filter(zoneRecs, (zone) => zone.zoneType ==  ZONE.COORDINATE)
      zoneRecs.forEach((zoneRec) => this.addZone(zoneRec))
      this.zones.setInActive()
    },
    addZone (zoneRec) {
      const zone = new Zone({
        id: zoneRec.zoneId,
        areaId: this.areaId,
        cd: zoneRec.zoneCd,
        name: zoneRec.zoneName,
        categoryId: zoneRec.categoryId,
        startX: zoneRec.x * this.aspectRatio,
        startY: zoneRec.y * this.aspectRatio,
        stage: this.stage,
      })
      zone.drawingRect(zone.startX + zoneRec.w * this.aspectRatio, zone.startY + zoneRec.h * this.aspectRatio)
      zone.fix(this.zoneFixMouseDown, this.drawAreaMouseUp)
      this.zones.add(zone)
    },
  }
}
</script>