import type {LabCategoryId} from '@shared/lab-explorer';
import type {EditorialMediaSlot} from '@/content/editorial-media';
import EditorialMedia from './EditorialMedia';
import LabCategoryIcon from './LabCategoryIcon';
const systemArt:Partial<Record<LabCategoryId,EditorialMediaSlot>>={heart:'bloodwork-heart',sugar:'bloodwork-sugar',liver:'bloodwork-liver',nutrients:'bloodwork-iron','blood-count':'bloodwork-cbc',bone:'bloodwork-bone',hormones:'bloodwork-hormones',inflammation:'bloodwork-inflammation',other:'bloodwork-other'};
export default function LabCategoryArt({categoryId}:{categoryId:LabCategoryId}){const slot=systemArt[categoryId];return slot?<EditorialMedia slot={slot} sizes="72px" showCaption={false}/>:<LabCategoryIcon categoryId={categoryId}/>;}
