import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js'; 
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

import 'core-js/stable';
import 'regenerator-runtime';
import recipeView from './views/recipeView.js';
import render from 'dom-serializer';

// https://forkify-api.herokuapp.com/v2
// API

// if(module.hot) {
//   module.hot.accept();
// }


const showRecipe = async function() {
  try {
    const id = window.location.hash.slice(1);
    if(!id) return;
    recipeView.renderSpinner()

    //0.Update results view to mar selected search results
    resultsView.update(model.getSearchResultsPage())
    
    //1. Loading recipe
    await model.loadRecipe(id); // Fiind o functie async,returneaza o promise 
    // si trebuie sa o chemam cu 'await'
    
    //2. Rendering recipe
    recipeView.render(model.state.recipe); //Importa clasa din fisierul celalalt
    // const recipeView = new recipeView(model.state.recipe);

    // 3)Update bookmarks view
    bookmarksView.update(model.state.bookmarks)
  }catch(err) {
    recipeView.renderError();
  }
}

const controlSearchResults = async function() {
  try{
    resultsView.renderSpinner()
    //1.Get search query
    const query = searchView.getQuery();
    if(!query) return;
    
    //2.load search results
    await model.loadSearchResults(query)
    //3.Render results
    // resultsView.render(model.state.search.results)
    resultsView.render(model.getSearchResultsPage())
    //4. Render initial pagination button
    paginationView.render(model.state.search)

  } catch ( err) {
    console.log(err); 
  }
}

const controlPagination = function(goToPage) {
  //1.Render new results
  // resultsView.render(model.state.search.results)
  resultsView.render(model.getSearchResultsPage(goToPage))
  //2. Render new pagination button
  paginationView.render(model.state.search)
}
const controlServings = function(newServings) {
  // Update the recipe serbings(in state)
  model.updateServings(newServings)
  //Update the recipe view
  // recipeView.render(model.state.recipe); 
  recipeView.update(model.state.recipe)
}

const controlAddBookmark = function() {
  //1.Add/remove bookmarks
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe)
  else model.deleteBookmark(model.state.recipe.id)
  //2.Update recipe view
  recipeView.update(model.state.recipe)
  //3.Render bookmarks
  bookmarksView.render(model.state.bookmarks)
}

const controlBookmarks = function() {
  bookmarksView.render(model.state.bookmarks)
}
const controlAddRecipe = async function(newRecipe){
  try {
    //Show loading spinner
    addRecipeView.renderSpinner()
  // Upload the new recipe data
   await model.uploadRecipe(newRecipe)
   console.log(model.state.recipe)
   //Render recipe
   recipeView.render(model.state.recipe)
   //SUCCES MESSAGE 
   addRecipeView.renderMessage()
   //Render bookmark view
   bookmarksView.render(model.state.bookmarks)
   //Change ID in url 
   window.history.pushState(null,'' , `#${model.state.recipe.id}`)
   //Close form window
   setTimeout(() => {
     addRecipeView.toggleWindow()
   }, MODAL_CLOSE_SEC * 1000);
  
} catch(err) {
  console.error('💣',err);
  addRecipeView.renderError(err.message)
}
}
const init= function() {
    bookmarksView.addHandlerRender(controlBookmarks);
    recipeView.addHandlerReneder(showRecipe);
    recipeView.addHandlerUpdateServings(controlServings);
    recipeView.addhandlerAddBookmark(controlAddBookmark);
    searchView.addHandlerSearch(controlSearchResults);
    paginationView.addHandlerClick(controlPagination);
    addRecipeView.addHandlerUpload(controlAddRecipe)
}
init()
