<template>
    <h1>Note Page</h1>
    <div class="row row-cols-1 row-cols-md-3 g-4" style="width: 100vw; margin-left: 1px;" v-if="isNoteLoaded">
        <div class="col" v-for="note in Notes" :key="note._id">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">{{note.heading}}</h5>
                    <p>{{note.content.substring(0,100)}}...</p>
                </div>
                <div class="card-footer">
                    <small class="text-body-secondary">Written by {{ note.author }} in {{note.place}} on {{new Date(note.date).toDateString()}}<br/></small>
                    <small class="text-body-secondary">Tags: {{note.tags.join('-')}}</small>
                </div>
                <button type="button" class="btn btn-outline-info">Read more</button>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { onMounted, computed, ref, watch, nextTick } from "vue";
    import axios from 'axios';
    const api_url = "http://localhost:3000/";

    var Notes = ref([]);

    const isNoteLoaded = computed(() => Notes.value.length > 0);

    async function getNotes(){
        try{
            const res = await axios.post(api_url + "getNotes/-1");
            Notes.value = res.data;
            await nextTick();
        }catch(error){
            console.log("Error fetching notes: ",error);
        }
    }

    onMounted(async () => {
        await getNotes();
    });
</script>