<template>
  <div>
    <div id="stage"></div>
  </div>
</template>

<script>
// import { DISP } from '../../sub/constant/config'
// import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import Konva from 'konva'

class Zone {
  constructor(prop) {
    this.MIN_WIDTH = 50
    this.MIN_HEIGHT = 50
    this.name = prop.name
    this.startX = prop.startX
    this.startY = prop.startY
    this.stage = prop.stage
    this.rectLayer = new Konva.Layer()
    this.stage.add(this.rectLayer)
    const size = this.stage.size()
    this.parentWidth = size.width
    this.parentHeight = size.height
    this.konvaRect = null
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
        newBoundBox.width = Math.min(this.parentWidth - newBoundBox.x, newBoundBox.width)
        // 下方向に伸長した場合
        newBoundBox.height = Math.min(this.parentHeight - newBoundBox.y, newBoundBox.height)
        return newBoundBox
      }
    })
    this.tr.on('mouseup', (e) => { e.evt.stopImmediatePropagation() })
    this.tr.on('mousedown', (e) => {e.evt.stopImmediatePropagation()})
    this.tr.on('mousemove', (e) => { e.evt.stopImmediatePropagation() })
    this._isActive = false
  }

  drawingRect(x, y) {
    const w = x - this.startX
    const h = y - this.startY
    this.rectLayer.removeChildren()
    this.konvaRect = new Konva.Rect({
      x: this.startX,
      y: this.startY,
      width: w,
      height: h,
      strokeWidth: 1,
      fill: 'rgba(0, 0, 209, 0.5)',
      stroke : 'rgba(32, 16, 64)',
      draggable: true,
      dragBoundFunc: (pos) => {
        const rect = this.konvaRect
        return {
          x: Math.max(0, Math.min(this.parentWidth - rect.scaleX() * rect.width() , pos.x)),
          y: Math.max(0, Math.min(this.parentHeight - rect.scaleY() * rect.height(), pos.y))
        }
      }
    })
    this.rectLayer.add(this.konvaRect)
    this.rectLayer.draw()
  }

  setListener(listener) {
    if (!this.konvaRect) {
      return
    }
    this.rectLayer.add(this.tr)
    this.konvaRect.setListening(true)
    this.konvaRect.on('mousedown', (e) => {
      listener(e)
      this.active()
    })
    this.konvaRect.on('mouseup', (e) => { e.evt.stopImmediatePropagation() })
    this.konvaRect.on('mouseenter', () => { this.stage.container().style.cursor = 'move' })
    this.konvaRect.on('mouseleave', () => { this.stage.container().style.cursor = 'default' })
    this.konvaRect.on('transformend', (e) => { e.evt.stopImmediatePropagation() })
    this.active()
  }

  active() {
    if (!this.konvaRect) {
      return
    }
    this._isActive = true
    this.tr.attachTo(this.konvaRect)
    this.rectLayer.draw()
  }

  inactive() {
    this._isActive = false
    this.tr.detach()
    this.rectLayer.draw()
  }

  remove() {
    this._isActive = false
    this.stage.container().style.cursor = 'default'
    if (this.konvaRect) {
      this.konvaRect.off('mousedown')
      this.konvaRect.off('mouseup')
      this.konvaRect.off('mouseenter')
      this.konvaRect.off('mouseleave')
      this.konvaRect.off('transformend')
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

  get x() {
    return this.konvaRect ? this.konvaRect.x() : -1
  }

  get y() {
    return this.konvaRect ? this.konvaRect.y() : -1
  }

  get width() {
    return this.konvaRect ? this.konvaRect.scaleX() * this.konvaRect.width() : 0
  }

  get height() {
    return this.konvaRect ? this.konvaRect.scaleY() * this.konvaRect.height() : 0
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
    if (target) {
      target.remove()
    }
    this.zones = this.zones.filter((e) => e.name !== null)
  }

  get activeZone() {
    return this.zones.find((e) => e.isActive)
  }

  get list() {
    return this.zones
  }
}

export default {
  plugins: [Konva],
  props: {
    areaId: {
      default: -1,
      type: Number 
    },
    isRegist: {
      default: false,
      type: Boolean
    },
    isSetNameCategory: {
      default: false,
      type: Boolean
    },
    name: {
      default: '',
      type: String,
    },
    categoryId: {
      default: -1,
      type: Number,
    },
    auth: {
      default: () => {return {regist: true, update: true, delete: true}},
      type: Object,
    },
  },
  data () {
    return {
      stage: null,
      fromX: 0,
      fromY: 0,
      toX: 0,
      toY: 0,
      deleted: [],
      dragging: false,
      zones: [],
      MINIMUM_SIZE: 50,
    }
  },
  computed: {
    isEditable(){
      return this.auth.regist || this.auth.update || this.auth.delete
    }
  },
  watch: {
    areaId: function(newVal, oldVal) {
      const areaImage = this.$store.state.app_service.areaImages.find((a) => { return a.areaId === newVal })
      const base64 = areaImage ? areaImage.mapImage : ''
      this.setupCanvas(base64)
    },
    isRegist: function(newVal, oldVal) {
      if (!newVal) {
        return
      }
      this.$emit('regist', this.canvas.getObjects(), this.deleted)
    },
  },
  mounted () {
    this.stage = new Konva.Stage({
      container: 'stage',
      width: 0,
      height: 0
    })
    const drawArea = document.getElementById('stage')
    const zones = new Zones()
    const that = this
    let zone = null
    let cnt = 0

    drawArea.addEventListener('mousedown', (e) => {
      that.dragging = true
      that.zones.forEach((e) => {e.inactive()})
      zone = new Zone({
        name: `Zone${++cnt}`,
        startX: e.offsetX,
        startY: e.offsetY,
        stage: that.stage,
      })
    })

    drawArea.addEventListener('mousemove', (e) => {
      if (!that.dragging) return
      zone.drawingRect(e.offsetX, e.offsetY)
    })

    drawArea.addEventListener('mouseup', (e) => {
      that.dragging = false 
      zone.setListener((rectEvent) => {
        rectEvent.evt.stopImmediatePropagation()
        that.dragging = false
        zones.setInActive()
      })
      if (zone.width < this.MINIMUM_SIZE || zone.height < this.MINIMUM_SIZE) {
        zone.remove()
        return
      }
      zones.add(zone)
    })

    window.addEventListener('keydown', (e) => {
      console.log(e)
      zones.deleteSelectedZone()
    })
    this.setupCanvas(this.base64)
  },
  methods: {
    setupCanvas (base64) {
      const stage = this.stage
      const img = new Image()
      img.onload = () => {
        stage.removeChildren()
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
      }
      img.src = base64
    },
  }
}
</script>