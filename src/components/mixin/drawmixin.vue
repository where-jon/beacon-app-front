
<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { Shape, Container, Text } from '@createjs/easeljs/dist/easeljs.module'

export default {
  methods: {
    drawArrowPoint(container, pos, triangleColor, caption){
      const triangle = new Shape()
      triangle.graphics.beginFill(triangleColor).drawPolyStar(0, -20, 20, 3, 0, 90)

      const label = new Text(caption)
      label.font = "16px Arial"
      label.color = "#000"
      label.textAlign = "center"
      label.textBaseline = "middle"
      label.y = -40

      const arrowContainer = new Container()
      arrowContainer.x = pos.x * pos.mapScale
      arrowContainer.y = pos.y * pos.mapScale
      arrowContainer.addChild(label)
      arrowContainer.addChild(triangle)

      container.addChild(arrowContainer)
    },
    drawDotPoint(container, pos, color, radius){
      const dot = new Shape()
      dot.graphics.beginFill(color).drawCircle(pos.x * pos.mapScale, pos.y * pos.mapScale, radius)
      container.addChild(dot)
    },
    getRGBA(rgbString, alpha){
      const opacity = `0${(Math.round(alpha * 255)).toString(16)}`.slice(-2)
      return `${rgbString}${opacity}`
    },
  }
}
</script>
