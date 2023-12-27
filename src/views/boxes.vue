<template>
  <div>
    <div>
      <!-- Display a list of boxes -->
      <Box v-for="box in boxes" :key="box._id" :box-info="box">
      </Box>
      <button @click="showCreateForm">Create New Box</button>


    </div>
  </div>
</template>

<script>
import Box from '../components/Box.vue'
export default {
  metaInfo: {
    title: "Gamer's Library Boxes",
    script: [
      { src: "https:/cdnjs.cloudflare.com/ajax/libs/axios/1.2.0/axios.min.js", async: true, defer: true },
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
        startCard: { name: "", set: "" },
        endCard: { name: "", set: "" },
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
    // Create or update a box
    saveBox() {
      if (this.editing) {
        // Update existing box (add the API endpoint)
        axios.put(`/api/boxes/${box._id}`, this.boxData).then(() => {
          this.fetchBoxes();
          this.showModal = false;
        });
      } else {
        // Create a new box (add the API endpoint)
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
        startCard: { name: "", set: "" },
        endCard: { name: "", set: "" },
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
};
</script>

<style lang="scss" scoped>
@import '@/css/modals.scss';
</style>
