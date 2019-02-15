<template>
  <div id="stage" />
</template>

<script>
// import { DISP } from '../../sub/constant/config'
// import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
// import showmapmixin from '../../components/mixin/showmapmixin.vue'
import Konva from 'konva'

class Zone {
  constructor(prop) {
    this.id = prop.id ? prop.id : -1 * (new Date().getTime())
    this.MIN_WIDTH = 50
    this.MIN_HEIGHT = 50
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
      width: this.width,
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

  get x() {
    return this.group ? this.group.x() : -1
  }

  get y() {
    return this.group ? this.group.y() : -1
  }

  get width() {
    return this.group ? this.group.scaleX() * this.group.width() : 0
  }

  get height() {
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

  get activeZone() {
    return this.zones.find((e) => e.isActive)
  }

  get list() {
    return this.zones
  }
}

export default {
  plugins: [Konva],
  // mixins: [showmapmixin],
  props: {
    areaId: {
      default: -1,
      type: Number 
    },
    nameAndCategory: {
      default: () => {return {name: '', categoryId: -1}},
      type: Object
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
      const areaImage = this.$store.state.app_service.areaImages.find((a) => { return a.areaId === newVal })
      const base64 = areaImage ? areaImage.mapImage : ''
      this.cnt = 0
      this.setupCanvas(base64)
    },
    nameAndCategory: {
      handler: function (newVal, oldVal) {
        const activeZone = this.zones.activeZone
        if (activeZone) {
          activeZone.rename(newVal.name)
          activeZone.categoryId = newVal.categoryId
        }
      },
      deep: true
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
    const emitZone = (z) => {
      this.$emit('selected', {
        id: z.id,
        name: z.name,
        top: z.y,
        left: z.x,
        width: z.width,
        height: z.height,
        categoryId: z.categoryId,
      })
    }

    drawArea.addEventListener('mousedown', (e) => {
      this.dragging = true
      this.zones.setAllInActive()
      this.$emit('unselected')
      zone = new Zone({
        name: `Zone${++this.cnt}`,
        categoryId: this.nameAndCategory.categoryId,
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
        emitZone(fixedZone)
        this.zones.setInActive()
      })
      if (zone.width < this.MINIMUM_SIZE || zone.height < this.MINIMUM_SIZE) {
        zone.remove()
        --this.cnt
        return
      }
      this.zones.add(zone)
      emitZone(zone)
    })

    window.addEventListener('keydown', (e) => {
      if (e.key !== 'Delete') return
      this.$emit('deleted', this.zones.deleteSelectedZone())
    })

    this.setupCanvas(this.base64)
  },
  methods: {
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
      }
      img.src = base64
    },
  }
}
</script>