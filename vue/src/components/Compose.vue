<template>
    <h1>Compose</h1>
    <form action="">
        <div id="row" style="text-align: center;">
            <label for="noteB">Note:</label>
            <input type="radio" id="noteB" name="typeNote" value="note" checked @click="typeI = 0"/>
            <label for="todoB">ToDo:</label>
            <input type="radio" id="todoB" name="typeNote" value="todo" @click="typeI = 1"/>
            <label for="publicCheck">Public:</label>
            <input type="checkbox" id="public" name="publicCheck"/>
        </div>
        <div class="row" style="position: relative; justify-content: center; align-items: center;">
            <div class="col-lg-4 col-md-4 col-sm-4">
                <div class="form-floating">
                    <input type="text" name="title" class="form-control" id="notetitle" required/>
                    <label for="notetitle" id="titleLabel">Title</label>
                </div>
            </div>
        </div>
        <div class="row" style="position: relative; justify-content: center; align-items: center;">
            <div class="col-lg-4 col-md-4 col-sm-4">
                <div class="form-floating">
                    <textarea name="post" class="form-control" placeholder="Write note here" id="textArea" style="height: 100px;" wrap="off" required></textarea>
                    <label for="textArea">{{ insertType[typeI] }}</label>
                </div>
            </div>
        </div>
        <div class="row" style="position: relative; align-items: center; justify-content: center;">
            <div class="col-lg-4 col-md-4 col-sm-4">
                <div class="form-floating">
                    <textarea name="tags" class="form-control" placeholder="Write tags" id="tagsArea" required></textarea>
                    <label for="tagsArea">Tags</label>
                </div>
            </div>
        </div>
        <div class="row" style="position: relative; justify-content: center; align-items: center;">
            <div class="col-lg-4 col-md-4 col-sm-4">
                <div class="form-floating">
                    <input type="text" name="place" class="form-control" id="placeArea" required/>
                    <label for="placeArea">Place</label>
                </div>
            </div>
        </div>
        <div class="row" style="position: relative; justify-content: center; align-items: center;">
            <div class="cool-lg-4 col-md-4 col-sm-4" style="position: relative; text-align: center;">
                <button type="button" class="btn btn-outline-info" style="margin-top: 10px;" id="publishB" @click.prevent="submit">Publish</button>
            </div>
        </div>
    </form>
</template>

<script setup>

import {ref} from "vue";

var typeI = ref(0);

var insertType = ["Note","To do list, put only one task for line"];

function insertNote(){
    insertType.value = "Note"
}

function insertTodo(){
    insertType.value = "To do list, put only one task for line";
}

function submit(){

}
</script>