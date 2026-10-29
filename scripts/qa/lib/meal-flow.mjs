// Both historical and current web flows, while retaining the real review API boundary.
export async function reviewThenSave(page){
 const review=page.getByRole('button',{name:'Review meal',exact:true});
 if(await review.count()){
  const response=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/meals/review'&&r.request().method()==='POST');
  await review.click();const result=await response;if(!result.ok())return result;
  await page.getByRole('heading',{name:'Review your meal',exact:true}).waitFor();
 }
 await page.getByRole('button',{name:'Save meal',exact:true}).click();
}

/** Use the visible canonical-row disclosure before interacting with its editor. */
export async function openIngredientRow(page,index){
 const row=page.getByRole('group',{name:`Ingredient ${index}`,exact:true});
 const summary=row.locator(':scope > summary');
 if(await summary.count()&&!await row.evaluate(element=>element.open))await summary.click();
 return row;
}
