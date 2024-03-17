<template>
  <div>
    <div>
      <!-- Display a list of boxes -->
      <Box v-for="box in sortedBoxes" :key="box._id" :box-info="box" @delete="deleteBox" @save="saveBox" />
      <button @click="showCreateForm">Create New Box</button>
      <transition name="modal" v-if="showModal">
        <div class="modal-mask">
          <div class="modal-wrapper">
            <Box class="modal-container" :box-info="boxData" :isEditOnly="true" @delete="showModal = false"
              @save="saveBox" />
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import Box from '../components/Box.vue'
import { mapState } from 'vuex';
export default {
  metaInfo: {
    title: "Gamer's Library Boxes",
    script: [
      { src: "https:/cdnjs.cloudflare.com/ajax/libs/axios/1.2.0/axios.min.js", async: true, defer: true },
      { src: "https:/code.jquery.com/jquery-3.6.0.js" },
      { src: "https:/code.jquery.com/ui/1.13.2/jquery-ui.js" },
    ],
    link: [
      { rel: 'stylesheet', href: '//code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css' }
    ]
  },
  components: {
    Box: Box
  },
  data() {
    return {
      showModal: false,
      editing: false,
      boxes: [],
      boxData: {
        name: "",
        type: "",
        releaseDate: "",
        startCard: undefined,
        endCard: undefined,
        sets: "",
      },
    };
  },
  methods: {
    fetchBoxes() {
      this.axios.get('/api/boxes').then((response) => {
        this.boxes = response.data;
      });
    },
    saveBox(boxInfo) {
      if (boxInfo._id !== undefined) {
        axios.put('/api/boxes/' + boxInfo._id, boxInfo).then(() => {
          this.fetchBoxes();
          this.showModal = false;
        });
      }
      else {
        axios.post('/api/boxes', this.boxData).then(() => {
          this.fetchBoxes();
          this.showModal = false;
        });
      }
    },
    // Delete a box
    deleteBox(boxId) {
      // Confirm the deletion and make an API request to delete the box
      if (confirm('Are you sure you want to delete this box?')) {
        // Add the API endpoint for deleting a box
        axios.delete(`/api/boxes/${boxId}`).then(() => {
          this.fetchBoxes();
        });
      }
    },
    // Show the create box form
    showCreateForm() {
      this.editing = false;
      this.boxData = {
        name: "",
        type: "",
        releaseDate: "",
        startCard: undefined,
        endCard: undefined,
        sets: "",
      };
      this.showModal = true;
    },
    // Cancel the edit/create operation
    cancelEdit() {
      this.showModal = false;
    },
  },
  created() {
    this.fetchBoxes();
  },
  computed: {
    sortedBoxes() {
      return this.boxes.sort((a,b) => {return new Date(a.releaseDate) - new Date(b.releaseDate)});
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/css/modals.scss';
</style>
