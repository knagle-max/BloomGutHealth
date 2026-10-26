// Both historical and current web flows, while retaining the real review API boundary.
export async function reviewThenSave(page){
 const review=page.getByRole('button',{name:'Review meal',exact:true});
 if(await review.count()){
  const response=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/meals/review'&&r.request().method()==='POST');
  await review.click();const result=await response;if(!result.ok())return result;
  await page.getByRole('heading',{name:'Review before saving',exact:true}).waitFor();
 }
 await page.getByRole('button',{name:'Save to my journal',exact:true}).click();
}
