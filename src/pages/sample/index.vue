
<template>
  <div class="container">
    <h1>Blog</h1>
    <ul>
      <li v-for="(post, index) in posts" :key="index">
        <nuxt-link :to="{ name: 'posts-id', params: { id: post.id } }">{{ post.title }}</nuxt-link>
      </li>
    </ul>
    <p><nuxt-link to="/">Back to home page</nuxt-link></p>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  asyncData(context) {
    console.log(context.req ? context.req.headers['user-agent'] : navigator != null ? navigator.userAgent : 'No user agent (generated)')
    // We can return a Promise instead of calling the callback
    return axios.get('https://jsonplaceholder.typicode.com/posts?aadd')
      .then((res) => {
        return { posts: res.data.slice(0, 5) }
      })
  },
  computed: {
    stateSample () { // sample
      return this.$store.state.pos.positions
    },
    getterSample () { // sample
      console.log(this.find(2))
      return this.$store.getters['pos/find'](2)
    },
  },
  head: {
    title: 'List of posts'
  }
}
</script>

<style scoped lang="scss">

.container {
  width: 70%;
  margin: auto;
  text-align: center;
  padding-top: 100px;
}
ul {
  list-style-type: none;
  padding: 0;
}
ul li {
  border: 1px #ddd solid;
  padding: 20px;
  text-align: left;
}
ul li a {
  color: gray;
}
p {
  font-size: 20px;
}
a {
  color: #41B883;
}
</style>