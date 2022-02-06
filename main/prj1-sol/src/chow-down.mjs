import { AppError } from './util.mjs';

/**
 * In addition to the docs for each method, each method is subject to
 * the following additional requirements:
 *
 *   + All string matching is case-insensitive.  Hence specifying
 *     cuisine "american" or "American" for locate() should return
 *     a list of all eateries having American cuisine.
 *
 *   + The implementation of each of the required methods should not
 *     require searching.  Instead, the returned object instance
 *     should set up suitable data structure which allow returning the
 *     requested information without searching.
 *  
 *   + Errors are returned by returning an object with property
 *     _errors which must be a list of objects, each having a 
 *     message property.
 */
class ChowDown {

  /** Create a new ChowDown object for specified eateries */
  constructor(eateries) {
    //TODO
    this.eateries = eateries;

    const loc = (cuisine) => (this.eateries.reduce((acc,e)=>
        ((e.cuisine).toLowerCase() === (cuisine).toLowerCase())
        ? acc.concat({ id: e.id , name: e.name , dist: e.dist }) : acc ,[])).sort((a,b) => a.dist - b.dist);
       
    this.loc = loc;

    const cat = (eid) => Object.keys(this.eateries.filter((x) => 
    (x.id === eid) ? x.menu : false )[0].menu);
    this.cat = cat;

    const menuObj = (eid,category) =>  
       {
       for(let i = 0; i < this.eateries.length;i++){
          if(this.eateries[i].id === eid){
            for(let j = 0;j < Object.keys(this.eateries[i].menu).length;j++){
              if(Object.keys(this.eateries[i].menu)[j].toLowerCase() === category.toLowerCase()){
                return Object.values(this.eateries[i].menu)[j];
              }
            }
          }
        }
        throw err;
      }
      this.menuObj = menuObj;
  }


  //result = Array.from(this.eateries).map(x => x);


  /** return list giving info for eateries having the
   *  specified cuisine.  The info for each eatery must contain the
   *  following fields: 
   *     id: the eatery ID.
   *     name: the eatery name.
   *     dist: the distance of the eatery.
   *  The returned list must be sorted by distance.  Return [] if
   *  there are no eateries for the specified cuisine.
   */
  locate(cuisine) {
    try{

        // let res = (this.eateries.reduce((acc,e)=>
        // ((e.cuisine).toLowerCase() === (cuisine).toLowerCase())
        // ? acc.concat({ id: e.id , name: e.name , dist: e.dist }) : acc ,[])).sort((a,b) => a.dist - b.dist);
       
        // return res.sort((a,b) => a.dist - b.dist);

        return this.loc(cuisine);
  
    }catch(err){
      const msg = `bad cuisine ${cuisine}`;
      return { _errors: [ new AppError(msg, { code: 'NOT_FOUND', }), ] };
    }
  }

  /** return list of menu categories for eatery having ID eid.  Return
   *  errors if eid is invalid with error object having code property
   *  'NOT_FOUND'.
   */
  categories(eid) {
    
    try{
      return this.cat(eid);
    }catch(err){
      const msg = `bad eatery id ${eid}`;
      return { _errors: [ new AppError(msg, { code: 'NOT_FOUND', }), ] };
    }
    
  }

  /** return list of menu-items for eatery eid in the specified
   *  category.  Return errors if eid or category are invalid
   *  with error object having code property 'NOT_FOUND'.
   */ 
  menu(eid, category) {
    //TODO
    try{
      return this.menuObj(eid,category);
    }catch(err){
      const msg = `bad menu with invalid id ${eid} or invalid category ${category}`;
      return { _errors: [ new AppError(msg, { code: 'NOT_FOUND', }), ] };
    }
        
  }
  
}

export default function make(eateries) {
  return new ChowDown(eateries);
}

