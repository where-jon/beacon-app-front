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
    this.startX = prop.startX
    this.startY = prop.startY
    this.stage = prop.stage
    this.rectLayer = new Konva.Layer()
    this.stage.add(this.rectLayer)
    this.konvaRect = null
    const anchorColor = '#b4b4b4'
    this.tr = new Konva.Transformer({
      anchorStroke: anchorColor,
      anchorFill: 'white',
      anchorSize: 10,
      borderStroke: anchorColor,
      borderDash: [3, 3],
      rotateEnabled: false,
    })
    this.tr.on('mousedown', (e) => {e.evt.stopImmediatePropagation()})
    this.tr.on('mousemove', (e) => {e.evt.stopImmediatePropagation()})
    this.drawingRect.bind(this)
    this.setListener.bind(this)
    this.attachTransformer.bind(this)
    this.detachTransformer.bind(this)
    this.active.bind(this)
    this.inactive.bind(this)
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
    })
    this.rectLayer.add(this.konvaRect)
    this.rectLayer.draw()
  }

  setListener(listener) {
    this.rectLayer.add(this.tr)
    this.attachTransformer()
    this.rectLayer.draw()
    this.konvaRect.setListening(true)
    this.konvaRect.on('mousedown', listener)
    this.konvaRect.on('mouseenter', () => { this.stage.container().style.cursor = 'move' })
    this.konvaRect.on('mouseleave', () => { this.stage.container().style.cursor = 'default' })
    this._isActive = true
  }

  active() {
    this._isActive = true
  }

  inactive() {
    this._isActive = false
  }

  get isActive() {
    return this._isActive
  }

  attachTransformer() {
    if (!this._isActive) {
      this.tr.attachTo(this.konvaRect)
      this._isActive = true
    }
  }

  detachTransformer() {
    this.tr.detach()
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
    // isSetNameCategory: function(newVal, oldVal) {
    //   if (!newVal) {
    //     return
    //   }
    //   const group = this.canvas.getActiveObject()
    //   group.name = this.name
    //   group.categoryId = this.categoryId
    //   const text = group.getObjects('text')[0]
    //   text.setText(this.name)
    //   this.canvas.renderAll()
    // }
  },
  mounted () {
    this.stage = new Konva.Stage({
      container: 'stage',
      width: 0,
      height: 0
    })

    const drawArea = document.getElementById('stage')
    const that = this
    let zone = null

    drawArea.addEventListener('mousedown', (e) => {
      that.dragging = true
      zone = new Zone({
        startX: e.offsetX,
        startY: e.offsetY,
        stage: that.stage,
      })
    })

    drawArea.addEventListener('mousemove', (e) => {
      if (!that.dragging) return
      zone.drawingRect(e.offsetX, e.offsetY)
    })

    const setInActive = () => {
      const active = that.zones.find((e) => { return e.isActive })
      if (active) {
        active.inactive()
      }
    }

    drawArea.addEventListener('mouseup', (e) => {
      that.dragging = false 
      zone.setListener((e) => {
        e.evt.stopImmediatePropagation()
        that.dragging = false
        setInActive()
        zone.active()
      })
      setInActive()
      zone.active()
      that.zones.push(zone)
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
    // setCanvasMovingListener(){
    //   const that = this
    //   // Canvas内でのみドラッグ可とする
    //   this.canvas.on('object:moving', function(e){
    //     const obj = e.target
    //     const topLeft = that.getTopLeft({
    //       x: obj.left,
    //       y: obj.top,
    //       width: obj.width,
    //       height: obj.height
    //     })
    //     obj.top = topLeft.top
    //     obj.left = topLeft.left
    //   })
    // },
  }
}
</script>