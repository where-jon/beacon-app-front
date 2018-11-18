<template>
  <canvas id="map" ref="map"></canvas>
</template>

<script>
import { fabric } from 'fabric'
import { DISP } from '../../sub/constant/config'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'

export default {
  data () {
    return {
      canvas: null,
      fromX: 0,
      fromY: 0,
      toX: 0,
      toY: 0,
      deleted: [],
    }
  },
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
    }
  },
  watch: {
    areaId: function(newVal, oldVal) {
      const area = this.$store.state.app_service.areas.find((a) => { return a.areaId === newVal })
      const base64 = area ? area.mapImage : ''
      this.setupCanvas(base64)
    },
    isRegist: function(newVal, oldVal) {
      if (!newVal) {
        return
      }
      this.$emit('regist', this.canvas.getObjects(), this.deleted)
    },
    isSetNameCategory: function(newVal, oldVal) {
      if (!newVal) {
        return
      }
      const group = this.canvas.getActiveObject()
      group.name = this.name
      group.categoryId = this.categoryId
      const text = group.getObjects('text')[0]
      text.setText(this.name)
      this.canvas.renderAll()
    }
  },
  methods: {
    setupCanvas (base64) {
      this.canvas.clear()
      const that = this
      fabric.Image.fromURL(base64, async function(img) {
          that.canvas.setWidth(parseInt(img.width, 10));
          that.canvas.setHeight(parseInt(img.height, 10));
          that.canvas.setBackgroundImage(img, that.canvas.renderAll.bind(that.canvas), {
            scaleX: 1,
            scaleY: 1,
          });
          that.addZones()
      })
    },
    async addZones() {
      if (!this.areaId) {
        return
      }
      const zones = await AppServiceHelper.fetchList(`/core/zone/area/${this.areaId}`, 'id')
      const that = this
      zones.forEach((e) => {
        that.addZone({
          id: e.zoneId,
          top: e.y,
          left: e.x,
          width: e.w,
          height: e.h,
          name: e.zoneName
        })
      })
    },
    getTopLeft (bounds) {
      const limitX = this.canvas.getWidth() - bounds.width
      const limitY = this.canvas.getHeight() - bounds.height
      return {
        top : bounds.y > -1 ? (limitY > bounds.y ? bounds.y : limitY) : 0,
        left: bounds.x > -1 ? (limitX > bounds.x ? bounds.x : limitX) : 0
      }
    },
    addZone (dimension) {
      const rect = new fabric.Rect({
        width: dimension.width,
        height: dimension.height,
        fill: 'blue',
        opacity: 0.3,
        stroke: 'blue',
        strokeWidth: 1,
        originX: 'center',
        originY: 'center',
      })

      const text = new fabric.Text(
      dimension.name.toString(),
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
        name: dimension.name,
        categoryId: this.categoryId
      });
      this.canvas.add(group);
      return group
    },
    assignId () {
      const ids = this.canvas.getObjects().map((e) => Math.abs(e.id))
      return ids.length > 0 ? Math.max(...ids) + 1 : 1
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

      if (Math.abs(that.fromX - that.toX) < DISP.ZONE.MIN_WIDTH ||
          Math.abs(that.fromY - that.toY) < DISP.ZONE.MIN_HEIGHT) {
        return;
      }

      const top = Math.floor(Math.min(that.fromY, that.toY))
      const left = Math.floor(Math.min(that.fromX, that.toX))
      const id = that.assignId()
      const dimension = {
        id: id * -1,
        categoryId: that.categoryId,
        top: top,
        left: left,
        width: Math.floor(Math.max(that.toX, that.fromX)) - left,
        height: Math.floor(Math.max(that.toY, that.fromY)) - top,
        name: 'zone' + id
      }
      const group = that.addZone(dimension)
      that.canvas.setActiveObject(group);
      that.$emit('created', dimension)
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
      if (active.id > 0) {
        that.deleted.push(active.id)
      }
      that.$emit('deleted', active.id)
    }, false);

    this.canvas.on('object:selected', function(event) {
      if (!event.e) {
        return
      }
      that.$emit('selected', {
        id: event.target.id,
        name: event.target.name,
        top: event.target.top,
        left: event.target.left,
        width: event.target.width,
        height: event.target.height,
        categoryId: event.target.categoryId,
      })
    })

    this.canvas.on('selection:cleared', function(e) {
      that.$emit('unselected')
    });

    this.setupCanvas(this.base64)
  }
}
</script>