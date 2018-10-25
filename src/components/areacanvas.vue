<template>
  <canvas id="map" ref="map"></canvas>
</template>

<script>
import { fabric } from 'fabric'
import { ZONE } from '../sub/constant/config'

export default {
  data () {
    return {
      canvas: null,
      fromX: 0,
      fromY: 0,
      toX: 0,
      toY: 0,
      index: 1,
      zones: []
    }
  },
  props: ['base64'],
  watch: {
    base64: function(newVal, oldVal) {
        this.setupCanvas(newVal)
    }
  },
  methods: {
    setupCanvas (base64) {
      this.canvas.clear()
      const that = this
      fabric.Image.fromURL(base64, function(img) {
          that.canvas.setWidth(parseInt(img.width, 10));
          that.canvas.setHeight(parseInt(img.height, 10));
          that.canvas.setBackgroundImage(img, that.canvas.renderAll.bind(that.canvas), {
            scaleX: 1,
            scaleY: 1,
          });
      })
    },
    getTopLeft (bounds) {
      const limitX = this.canvas.getWidth() - bounds.width
      const limitY = this.canvas.getHeight() - bounds.height
      return {
        top : bounds.y > -1 ? (limitY > bounds.y ? bounds.y : limitY) : 0,
        left: bounds.x > -1 ? (limitX > bounds.x ? bounds.x : limitX) : 0
      }
    }
  },
  mounted () {
    this.canvas = new fabric.Canvas('map')
    const that = this

    // Canvas内でのみドラッグ可とする
    this.canvas.on('object:moving', function(e){
      const obj = e.target;
      const topLeft = that.getTopLeft({
        x: obj.left,
        y: obj.top,
        width: obj.width,
        height: obj.height
      })
      obj.top = topLeft.top
      obj.left = topLeft.left
    })

    this.canvas.on('mouse:down', function(e) {
      that.fromX = e.e.offsetX;
      that.fromY = e.e.offsetY;
    })

    this.canvas.on('mouse:up', function(e) {

      if (e.target !== null) {
        return
      }

      that.toX = e.e.offsetX
      that.toY = e.e.offsetY

      if (Math.abs(that.fromX - that.toX) < ZONE.MIN_WIDTH ||
          Math.abs(that.fromY - that.toY) < ZONE.MIN_HEIGHT) {
        return;
      }

      const dimension = {
        id: that.index++,
        top: Math.floor(Math.min(that.fromY, that.toY)),
        left: Math.floor(Math.min(that.fromX, that.toX)),
        bottom: Math.floor(Math.max(that.toY, that.fromY)),
        right: Math.floor(Math.max(that.toX, that.fromX)),
        name: 'zone'
      }

      const rect = new fabric.Rect({
        width: dimension.right - dimension.left,
        height: dimension.bottom - dimension.top,
        fill: 'blue',
        opacity: 0.3,
        stroke: 'blue',
        strokeWidth: 1,
        originX: 'center',
        originY: 'center',
      })

      const text = new fabric.Text(
      dimension.id.toString(),
      {
        fontSize: 20,
        fill: '#fff',
        originX: 'center',
        originY: 'center'
      })

      const group = new fabric.Group([ rect, text ], {
        id: dimension.id,
        left: dimension.left,
        top: dimension.top,
        hasRotatingPoint: false,
        lockRotation: true,
        name: dimension.name + dimension.id
      });
      that.canvas.add(group);
      that.canvas.setActiveObject(group);
      that.zones.push(dimension)
      that.$emit('created', {
        id: dimension.id,
        name: dimension.name + dimension.id,
      })
    })

    // DELボタン押下時に選択エリアを削除する
    const canvasWrapper = document.getElementsByClassName('upper-canvas')[0];
    canvasWrapper.tabIndex = 1000;
    canvasWrapper.addEventListener("keydown", function(e) {
      if (e.keyCode !== 46) {
        return
      }
      const active = that.canvas.getActiveObject();
      if (!active) {
          return
      }
      that.canvas.remove(active)
      that.zones = that.zones.filter((e) => {return e.id !== active.id})
      console.log(active)
      that.$emit('deleted', active.id)
    }, false);

    this.canvas.on('object:selected', function(event) {
      if (!event.e) {
        return
      }
      that.$emit('selected', {
        id: event.target.id,
        name: event.target.name,
      })
    })

    this.setupCanvas(this.base64)
  }
}
</script>