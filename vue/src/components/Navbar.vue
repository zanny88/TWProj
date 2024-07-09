<template>
    <div class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
            <router-link class="navbar-brand" to="/">Note</router-link>
            <button class="navbar-toggler" type="button" data-bs-toggle="collpase" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navMenu">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Show
                        </a>
                        <ul class="dropdown-menu" id="navbarDropdownList" aria-labelledby="navbarDropdown" style="z-index: 1051;">
                            <li><router-link class="dropdown-item" to="/showNote">Notes</router-link></li>
                            <li><router-link class="dropdown-item" to="/showTodo">To Do</router-link></li>
                        </ul>
                    </li>
                    <li class="nav-item">
                        <li><router-link class="nav-link" to="/create">Add</router-link></li>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Tomato Timer</a>
                    </li>
                    <form class="d-flex position-relative" role="search" id="searchForm">
                        <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search" id="searchInput" autocomplete="off"/>
                        <div class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" id="filterDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Filtri
                            </a>
                            <ul class="dropdown-menu" id="filterDropdownList" aria-labelledby="filterDropdown" style="z-index: 1051;">
                                <li><input type="radio" name="filterB" value="heading" checked/>Titolo</li>
                                <li><input type="radio" name="filterB" value="heading" />Autore</li>
                                <li><input type="radio" name="filterB" value="heading" />Luogo</li>
                                <li><input type="radio" name="filterB" value="heading" />Data</li>
                                <li><input type="radio" name="filterB" value="heading" />Tag</li>
                                <li><input type="radio" name="filterB" value="heading" />Friends</li>
                            </ul>
                        </div>
                        <button class="btn btn-outline-success" type="submit">Search</button>
                        <div class="list-group position-absolute w-100" sytle="z-index: 1050;" id="resultList"></div>
                    </form>
                </ul>
            </div>
        </div>
    </div>
</template>