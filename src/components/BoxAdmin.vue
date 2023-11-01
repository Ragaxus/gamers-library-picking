<template>
  <div>
    <div>
      <!-- Display a list of boxes -->
      <div v-for="box in boxes" :key="box._id">
        <div>
          <h2>{{ box.name }}</h2>
          <p>Type: {{ box.type }}</p>
          <p>Release Date: {{ box.releaseDate }}</p>
          <p>
            Start Card: {{ box.startCard.name }} ({{ box.startCard.set }})
          </p>
          <p>
            End Card: {{ box.endCard.name }} ({{ box.endCard.set }})
          </p>
          <p>Sets: {{ box.sets.join(', ') }}</p>
        </div>
        <button @click="editBox(box)">Edit</button>
        <button @click="deleteBox(box._id)">Delete</button>
      </div>
    </div>
    <button @click="showCreateForm">Create New Box</button>

    <!-- Modal for creating/editing a box -->
    <div v-if="showModal">
      <div class="modal">
        <h2 v-if="editing">Edit Box</h2>
        <h2 v-else>Create New Box</h2>
        <form @submit.prevent="saveBox">
          <input type="text" v-model="boxData.name" placeholder="Name" />
          <input type="text" v-model="boxData.type" placeholder="Type" />
          <input type="date" v-model="boxData.releaseDate" placeholder="Release Date" />
          <input type="text" v-model="boxData.startCard.name" placeholder="Start Card Name" />
          <input type="text" v-model="boxData.startCard.set" placeholder="Start Card Set" />
          <input type="text" v-model="boxData.endCard.name" placeholder="End Card Name" />
          <input type="text" v-model="boxData.endCard.set" placeholder="End Card Set" />
          <input type="text" v-model="boxData.sets" placeholder="Sets (comma-separated)" />
          <button type="submit">{{ editing ? "Update" : "Create" }}</button>
          <button @click="cancelEdit">Cancel</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
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
    // Fetch boxes from your MongoDB database (add the API endpoint)
    fetchBoxes() {
      // Use Axios or another HTTP library to make an API request
      // Replace 'api/boxes' with your actual API endpoint
      axios.get('/api/boxes').then((response) => {
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
    // Edit a box
    editBox(box) {
      this.editing = true;
      this.boxData = { ...box };
      this.showModal = true;
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

<style scoped>
/* Add your CSS styling here */
</style>
