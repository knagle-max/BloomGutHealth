import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
export default function AccountDataExport() {
  const [acknowledged,setAcknowledged]=useState(false);
  const download=useMutation({mutationFn:async()=>{
    const response=await apiRequest("GET","/api/account/export");
    const blob=await response.blob();
    const url=URL.createObjectURL(blob),anchor=document.createElement("a");
    try {anchor.href=url;anchor.download="bloom-account-records.json";document.body.appendChild(anchor);anchor.click();}
    finally {anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  }});
  return <div className="space-y-3"><h3>Download my account records</h3><p>One JSON file includes your Profile, meal journal, gut reports and stored historical analyses, biology records, private labels, settings, training, check-ins and stored health-source records. Original recorded units and provenance are preserved.</p><p className="panel-note">This file excludes passwords, sessions, internal file paths, operational logs, backups and data held by external providers. Downloading does not erase data or revoke permissions. Historical analyses are included as stored, without validating their medical meaning.</p><label className="block"><input type="checkbox" checked={acknowledged} onChange={e=>setAcknowledged(e.target.checked)}/> I understand this file contains sensitive health information and will store it privately.</label><Button variant="outline" disabled={!acknowledged||download.isPending} onClick={()=>download.mutate()}>{download.isPending?"Preparing account records…":"Download my account records"}</Button>{download.isSuccess&&<p role="status">Download prepared. Check your browser downloads and store the file privately.</p>}{download.error&&<p role="alert">{download.error.message}</p>}</div>;
}
