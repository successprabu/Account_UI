import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Tesseract from 'tesseract.js';
import { toast } from 'react-toastify';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import KeyboardOutlinedIcon from '@mui/icons-material/KeyboardOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { API_SERVICE } from '../common/CommonMethod';
import { SAVE_NEW_TRANS_API } from '../common/CommonApiURL';
import { rupees } from './shared';

const blankManual = { name: '', villageName: '', amount: '', oldAmount: '', newAmount: '', initial: '', phoneNo: '', remarks: '' };

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    return null;
  }
};

/** Bulk import of moi receipts: read a photo with OCR, or type several entries, check them, then save. */
const ReceiptImportDialog = ({ open, onClose, schema, onSaved }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState('photo');
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [extractedRecords, setExtractedRecords] = useState([]);
  const [selectAll, setSelectAll] = useState(true);
  const [isImportSaving, setIsImportSaving] = useState(false);
  const [manualRecords, setManualRecords] = useState([]);
  const [currentRecord, setCurrentRecord] = useState(blankManual);

  // ---- OCR (unchanged from the original screen)
  const extractTextFromImage = async (imageFile) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const img = new Image();
          img.src = e.target.result;
          await new Promise((r) => {
            img.onload = r;
          });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageDataObj.data;
          for (let i = 0; i < data.length; i += 4) {
            const brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
            const contrast = 1.5;
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
            data[i] = factor * (brightness - 128) + 128;
            data[i + 1] = factor * (brightness - 128) + 128;
            data[i + 2] = factor * (brightness - 128) + 128;
          }
          ctx.putImageData(imageDataObj, 0, 0);
          const processed = canvas.toDataURL();
          const result = await Tesseract.recognize(processed, 'tam+eng', {
            logger: (m) => {
              if (m.status === 'recognizing text') setProcessingProgress(Math.floor(m.progress * 100));
            },
            tessedit_pageseg_mode: 6,
            preserve_interword_spaces: 1,
          });
          const englishResult = await Tesseract.recognize(processed, 'eng', { logger: () => {} });
          resolve(`${result.data.text}\n${englishResult.data.text}`);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });

  const parseRecordsFromText = (text) => {
    const records = [];
    const lines = text.split('\n').filter((line) => line.trim());
    const patterns = [
      /(.+?)\s*[-–—]\s*(.+?)\s*[-–—]\s*(\d+(?:\.\d+)?)/i,
      /(.+?)\s*:\s*(.+?)\s*:\s*(\d+(?:\.\d+)?)/i,
      /(.+?)\s*\|\s*(.+?)\s*\|\s*(\d+(?:\.\d+)?)/i,
      /(\w+(?:\s+\w+)*)\s+(\w+(?:\s+\w+)*)\s+(\d+(?:\.\d+)?)/i,
    ];
    for (const line of lines) {
      let parsed = false;
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          const [, name, village, amount] = match;
          records.push({ id: Date.now() + Math.random() * 1000, name: name.trim(), villageName: village.trim(), amount: parseFloat(amount), oldAmount: 0, newAmount: 0, initial: '', phoneNo: '', remarks: '', isSelected: true, originalText: line });
          parsed = true;
          break;
        }
      }
      if (!parsed && line.trim()) {
        records.push({ id: Date.now() + Math.random() * 1000, name: line.trim().substring(0, 50), villageName: '', amount: 0, oldAmount: 0, newAmount: 0, initial: '', phoneNo: '', remarks: line.trim(), isSelected: true, originalText: line });
      }
    }
    return records;
  };

  const processAmountDistribution = (records) =>
    records.map((record) => {
      if (record.amount > 0) return { ...record, newAmount: record.amount, oldAmount: 0, amount: record.amount };
      if (record.amount < 0) return { ...record, oldAmount: Math.abs(record.amount), newAmount: 0, amount: 0 };
      return record;
    });

  const withAccount = (record) => {
    const u = readUser();
    return {
      ...record,
      customerId: u?.customerID || 0,
      functionId: u?.functionId || 0,
      createdBy: String(u?.id || 'SYSTEM'),
      createdDt: new Date().toISOString(),
      updatedBy: String(u?.id || 'SYSTEM'),
      updatedDt: new Date().toISOString(),
      isActive: true,
      type: 'R',
      returnStatus: 'N',
      returnRemark: '',
    };
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, JPG)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }
    setMode('photo');
    setImagePreview(URL.createObjectURL(file));
    setIsProcessing(true);
    setProcessingProgress(0);
    try {
      const text = await extractTextFromImage(file);
      const parsed = processAmountDistribution(parseRecordsFromText(text)).map(withAccount);
      setExtractedRecords(parsed);
      toast.success(`Successfully extracted ${parsed.length} records from image`);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image. Please try again with a clearer image.');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ---- editing the extracted list
  const toggleRecordSelection = (id) => setExtractedRecords((rs) => rs.map((r) => (r.id === id ? { ...r, isSelected: !r.isSelected } : r)));
  const toggleSelectAll = () => {
    const next = !selectAll;
    setSelectAll(next);
    setExtractedRecords((rs) => rs.map((r) => ({ ...r, isSelected: next })));
  };
  const handleRecordEdit = (id, field, value) =>
    setExtractedRecords((rs) =>
      rs.map((r) => {
        if (r.id !== id) return r;
        const u = { ...r, [field]: value };
        if (field === 'oldAmount' || field === 'newAmount') u.amount = Number(u.oldAmount) + Number(u.newAmount);
        return u;
      })
    );

  const selected = extractedRecords.filter((r) => r.isSelected);
  const selectedTotal = selected.reduce((t, r) => t + (r.amount || 0), 0);

  // ---- manual entry
  const addManualRecord = () => {
    if (!currentRecord.name || !currentRecord.villageName) {
      toast.error('Please enter at least Name and Village');
      return;
    }
    setManualRecords((rs) => [
      ...rs,
      withAccount({
        id: Date.now() + Math.random() * 1000,
        name: currentRecord.name,
        villageName: currentRecord.villageName,
        amount: parseFloat(currentRecord.amount) || 0,
        oldAmount: parseFloat(currentRecord.oldAmount) || 0,
        newAmount: parseFloat(currentRecord.newAmount) || 0,
        initial: currentRecord.initial || '',
        phoneNo: currentRecord.phoneNo || '',
        remarks: currentRecord.remarks || '',
        isSelected: true,
      }),
    ]);
    setCurrentRecord(blankManual);
    toast.success('Record added successfully');
  };
  const confirmManualRecords = () => {
    if (manualRecords.length === 0) {
      toast.error('No records to import');
      return;
    }
    setExtractedRecords(manualRecords);
    setMode('photo');
    toast.success(`${manualRecords.length} records ready for import`);
    setManualRecords([]);
  };

  // ---- save
  const reset = () => {
    setImagePreview(null);
    setExtractedRecords([]);
    setSelectAll(true);
    setProcessingProgress(0);
    setManualRecords([]);
    setCurrentRecord(blankManual);
    setMode('photo');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const close = () => {
    if (isImportSaving) return;
    reset();
    onClose();
  };

  const saveImportedRecords = async () => {
    if (selected.length === 0) {
      toast.error('No records selected for import');
      return;
    }
    setIsImportSaving(true);
    try {
      let successCount = 0;
      let errorCount = 0;
      for (const record of selected) {
        try {
          await schema.validate({ ...record, villageName: record.villageName || 'Unknown', name: record.name || 'Unknown' }, { abortEarly: false });
          await API_SERVICE.post(SAVE_NEW_TRANS_API, {
            id: 0,
            customerId: record.customerId,
            villageName: record.villageName,
            initial: record.initial || '',
            name: record.name,
            oldAmount: record.oldAmount || 0,
            newAmount: record.newAmount || 0,
            amount: record.amount || record.oldAmount + record.newAmount,
            remarks: record.remarks || '',
            phoneNo: record.phoneNo || '',
            createdBy: record.createdBy,
            createdDt: record.createdDt,
            updatedBy: record.updatedBy,
            updatedDt: record.updatedDt,
            isActive: true,
            type: 'R',
            returnStatus: 'N',
            returnRemark: '',
            functionId: record.functionId,
          });
          successCount += 1;
        } catch (error) {
          console.error('Error saving record:', error);
          errorCount += 1;
          if (error.inner) toast.error(`Validation failed for record "${record.name}": ${error.inner.map((x) => x.message).join(', ')}`);
        }
      }
      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} records${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
        reset();
        onSaved?.(successCount);
        onClose();
      } else {
        toast.error('Failed to import records. Please check the data and try again.');
      }
    } catch (error) {
      console.error('Error in bulk save:', error);
      toast.error('An error occurred while saving records. Please try again.');
    } finally {
      setIsImportSaving(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      ['Name', 'Village', 'Amount', 'Old Amount', 'New Amount', 'Initial', 'Phone No', 'Remarks'],
      ['John Doe', 'Main Street', '1000', '', '', 'JD', '1234567890', 'Sample remark'],
      ['Jane Smith', 'Park Avenue', '', '500', '500', 'JS', '0987654321', 'Another sample'],
    ];
    const blob = new Blob([template.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded successfully');
  };

  const cell = (record, field, numeric) => (
    <TextField
      size="small"
      value={record[field]}
      type={numeric ? 'number' : 'text'}
      onChange={(e) => handleRecordEdit(record.id, field, numeric ? parseFloat(e.target.value) || 0 : e.target.value)}
      inputProps={{ 'aria-label': field, style: { padding: '6px 8px' } }}
      sx={{ minWidth: numeric ? 90 : 120 }}
    />
  );

  const showTable = mode === 'photo' && extractedRecords.length > 0 && !isProcessing;

  return (
    <Dialog open={open} onClose={close} fullScreen={fullScreen} maxWidth="lg" fullWidth scroll="paper">
      <DialogTitle sx={{ pr: 6 }}>
        Import receipts
        <IconButton onClick={close} disabled={isImportSaving} aria-label="Close" sx={{ position: 'absolute', right: 12, top: 12 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {/* Always mounted so "Upload different image" works from any step. */}
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleImageUpload} hidden />
        <ToggleButtonGroup exclusive value={mode} onChange={(_, v) => v && setMode(v)} size="small" sx={{ mb: 2.5 }} aria-label="Import method">
          <ToggleButton value="photo"><PhotoCameraOutlinedIcon fontSize="small" sx={{ mr: 1 }} />From a photo</ToggleButton>
          <ToggleButton value="manual"><KeyboardOutlinedIcon fontSize="small" sx={{ mr: 1 }} />Type entries</ToggleButton>
        </ToggleButtonGroup>

        <AnimatePresence mode="wait">
          {mode === 'photo' && isProcessing && (
            <Stack key="processing" component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} alignItems="center" spacing={2} sx={{ py: 5 }}>
              <CircularProgress />
              <Typography variant="h6">Reading the photo…</Typography>
              <Box sx={{ width: '100%', maxWidth: 420 }}>
                <LinearProgress variant="determinate" value={processingProgress} sx={{ height: 8, borderRadius: 4 }} />
                <Typography variant="caption" color="text.secondary">{processingProgress}%</Typography>
              </Box>
              {imagePreview && <Box component="img" src={imagePreview} alt="Uploaded page" sx={{ maxWidth: '100%', maxHeight: 200, borderRadius: 2, border: 1, borderColor: 'divider' }} />}
            </Stack>
          )}

          {mode === 'photo' && !isProcessing && extractedRecords.length === 0 && (
            <Stack key="empty" component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} alignItems="center" textAlign="center" spacing={1.5} sx={{ py: 5 }}>
              <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: 'action.hover', display: 'grid', placeItems: 'center', color: 'primary.main' }}>
                <UploadFileOutlinedIcon sx={{ fontSize: 36 }} />
              </Box>
              <Typography variant="h6">Upload a photo of the moi list</Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 520 }}>
                A clear photo with name, village and amount on each line, in Tamil, English or Malayalam. For handwritten Tamil, typing the entries is more accurate.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
                <Button variant="contained" startIcon={<UploadFileOutlinedIcon />} onClick={() => fileInputRef.current?.click()}>Choose photo</Button>
                <Button startIcon={<DownloadOutlinedIcon />} onClick={downloadTemplate}>Download template</Button>
              </Stack>
              <Typography variant="caption" color="text.secondary">JPEG or PNG, up to 10 MB</Typography>
            </Stack>
          )}

          {showTable && (
            <Box key="table" component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                {[['Records', extractedRecords.length], ['Selected', selected.length], ['Total', rupees(selectedTotal)]].map(([l, v]) => (
                  <Grid item xs={4} key={l}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                      <Typography variant="caption" color="text.secondary">{l}</Typography>
                      <Typography fontWeight={700}>{v}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox"><Checkbox checked={selectAll} onChange={toggleSelectAll} inputProps={{ 'aria-label': 'Select all' }} /></TableCell>
                      <TableCell>#</TableCell>
                      <TableCell>Name *</TableCell>
                      <TableCell>Village *</TableCell>
                      <TableCell>Initial</TableCell>
                      <TableCell>Old amount</TableCell>
                      <TableCell>New amount</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {extractedRecords.map((r, i) => (
                      <TableRow key={r.id} hover selected={r.isSelected}>
                        <TableCell padding="checkbox"><Checkbox checked={r.isSelected} onChange={() => toggleRecordSelection(r.id)} inputProps={{ 'aria-label': `Select row ${i + 1}` }} /></TableCell>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{cell(r, 'name')}</TableCell>
                        <TableCell>{cell(r, 'villageName')}</TableCell>
                        <TableCell>{cell(r, 'initial')}</TableCell>
                        <TableCell>{cell(r, 'oldAmount', true)}</TableCell>
                        <TableCell>{cell(r, 'newAmount', true)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{rupees(r.amount)}</TableCell>
                        <TableCell>{cell(r, 'phoneNo')}</TableCell>
                        <TableCell>{cell(r, 'remarks')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {mode === 'manual' && (
            <Box key="manual" component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Alert severity="info" sx={{ mb: 2 }}>Type several entries, then press <b>Continue</b> to check and save them together.</Alert>
              <Grid container spacing={1.5} component="form" onSubmit={(e) => { e.preventDefault(); addManualRecord(); }}>
                {[
                  ['name', 'Name *', 3],
                  ['villageName', 'Village *', 3],
                  ['amount', 'Amount', 2, true],
                  ['initial', 'Initial', 1],
                  ['phoneNo', 'Phone', 3],
                  ['remarks', 'Remarks', 9],
                ].map(([f, l, md, num]) => (
                  <Grid item xs={12} sm={6} md={md} key={f}>
                    <TextField fullWidth size="small" label={l} type={num ? 'number' : 'text'} value={currentRecord[f]} onChange={(e) => setCurrentRecord((c) => ({ ...c, [f]: e.target.value }))} />
                  </Grid>
                ))}
                <Grid item xs={12} md={3}>
                  <Button fullWidth type="submit" variant="contained" color="success" startIcon={<AddIcon />} sx={{ height: 40 }}>Add entry</Button>
                </Grid>
              </Grid>
              {manualRecords.length > 0 && (
                <TableContainer sx={{ mt: 2.5, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell><TableCell>Name</TableCell><TableCell>Village</TableCell><TableCell align="right">Amount</TableCell><TableCell>Phone</TableCell><TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <AnimatePresence initial={false}>
                        {manualRecords.map((r, i) => (
                          <TableRow key={r.id} component={motion.tr} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                            <TableCell>{i + 1}</TableCell>
                            <TableCell>{r.name}</TableCell>
                            <TableCell>{r.villageName}</TableCell>
                            <TableCell align="right">{rupees(r.amount)}</TableCell>
                            <TableCell>{r.phoneNo}</TableCell>
                            <TableCell align="right">
                              <Tooltip title="Remove"><IconButton size="small" onClick={() => setManualRecords((rs) => rs.filter((x) => x.id !== r.id))} aria-label={`Remove ${r.name}`}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </AnimatePresence>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={close} disabled={isImportSaving}>Cancel</Button>
        <Box sx={{ flex: 1 }} />
        {showTable && (
          <>
            <Button startIcon={<UploadFileOutlinedIcon />} onClick={() => fileInputRef.current?.click()} disabled={isImportSaving}>Upload different image</Button>
            <Button variant="contained" color="success" onClick={saveImportedRecords} disabled={isImportSaving || selected.length === 0} startIcon={isImportSaving ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}>
              {isImportSaving ? 'Saving…' : `Save ${selected.length} ${selected.length === 1 ? 'entry' : 'entries'}`}
            </Button>
          </>
        )}
        {mode === 'manual' && (
          <Button variant="contained" onClick={confirmManualRecords} disabled={manualRecords.length === 0}>
            Continue with {manualRecords.length} {manualRecords.length === 1 ? 'entry' : 'entries'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ReceiptImportDialog;
