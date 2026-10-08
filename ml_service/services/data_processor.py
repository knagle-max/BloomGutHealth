"""
Data Processor: Handles microbiome test file uploads and preprocessing.

This module processes various microbiome file formats (FASTQ, FASTA, CSV)
and prepares them for ML analysis.
"""

from fastapi import UploadFile
import json
import uuid
from typing import Dict, Any
from pathlib import Path

class DataProcessor:
    """
    Processes uploaded microbiome test files.
    """
    
    def __init__(self):
        self.upload_dir = Path("/tmp/microbiome_uploads")
        self.upload_dir.mkdir(exist_ok=True)
    
    async def process_upload(self, file: UploadFile) -> Dict[str, Any]:
        """
        Process uploaded file and extract microbiome data.
        
        Supports:
        - FASTQ/FASTA: Raw sequencing data
        - CSV: Pre-processed bacterial abundance data
        - JSON: Structured microbiome data
        """
        
        if not file.filename:
            raise ValueError("No filename provided")
        
        file_extension = file.filename.split('.')[-1].lower()
        file_path = self.upload_dir / (str(uuid.uuid4()) + "." + file_extension)
        
        # Save file
        content = await file.read()
        with open(file_path, 'wb') as f:
            f.write(content)
        
        # Process based on format
        if file_extension in ['fastq', 'fasta', 'fa', 'fq']:
            result = self._process_sequence_file(file_path, file_extension)
        elif file_extension == 'csv':
            result = self._process_csv_file(file_path)
        elif file_extension == 'json':
            result = self._process_json_file(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")
        
        return {
            "file_path": str(file_path),
            "format": file_extension,
            "preview": result,
            "raw_data": result.get("raw_data")
        }
    
    def _process_sequence_file(self, file_path: Path, format: str) -> Dict[str, Any]:
        """
        Process FASTQ/FASTA sequencing files.
        In production, this would use BioPython for sequence analysis.
        """
        try:
            from Bio import SeqIO
            
            # Read first 5 sequences as preview
            sequences = []
            with open(file_path, 'r') as f:
                for i, record in enumerate(SeqIO.parse(f, format)):
                    if i >= 5:
                        break
                    sequences.append({
                        "id": record.id,
                        "length": len(record.seq),
                        "sequence": str(record.seq)[:50] + "..." if len(record.seq) > 50 else str(record.seq)
                    })
            
            return {
                "type": "sequence_data",
                "format": format,
                "preview_sequences": sequences,
                "note": "Raw sequences will be processed for taxonomic profiling"
            }
        except Exception as e:
            return {
                "type": "sequence_data",
                "format": format,
                "error": str(e),
                "note": "File uploaded successfully, processing may require additional tools"
            }
    
    def _process_csv_file(self, file_path: Path) -> Dict[str, Any]:
        """
        Process CSV file with bacterial abundance data.
        """
        import csv
        
        percentages = {}
        with open(file_path, 'r') as f:
            reader = csv.DictReader(f)
            if reader.fieldnames != ['bacteria', 'abundance']:
                raise ValueError('CSV requires bacteria,abundance columns in percent units')
            for row in reader:
                name = row['bacteria'].strip()
                if not name or name in percentages:
                    raise ValueError('Taxa must be nonempty and distinct')
                percentages[name] = float(row['abundance'])
        self._validate_percentages(percentages)
        return {"type": "abundance_data", "format": "csv", "preview_rows": list(percentages.items())[:5], "raw_data": {"bacteria_percentages": percentages}}

    def _validate_percentages(self, percentages):
        import math
        if not isinstance(percentages, dict) or not percentages or len(percentages) > 1000:
            raise ValueError('Require 1 to 1000 distinct taxa')
        if any(not isinstance(name, str) or not name.strip() or isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or not 0 <= value <= 100 for name, value in percentages.items()):
            raise ValueError('Taxa require finite percentage values from 0 to 100')
        if sum(percentages.values()) > 100.01:
            raise ValueError('Percentages must sum to at most 100; do not mix taxonomic levels')

    def _process_json_file(self, file_path: Path) -> Dict[str, Any]:
        """
        Process JSON file with structured microbiome data.
        """
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        self._validate_percentages(data.get("bacteria_percentages") if isinstance(data, dict) else None)
        return {
            "raw_data": data,
            "type": "structured_data",
            "format": "json",
            "preview": data if isinstance(data, dict) else data[:5] if isinstance(data, list) else str(data)[:200],
            "note": "Structured data ready for analysis"
        }
