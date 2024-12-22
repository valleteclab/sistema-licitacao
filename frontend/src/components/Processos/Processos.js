import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Alert,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import api from '../../services/api';

const Processos = () => {
    const [processos, setProcessos] = useState([]);
    const [fluxos, setFluxos] = useState([]);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        titulo: '',
        descricao: '',
        fluxo_id: '',
        documentos: ''
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadProcessos();
        loadFluxos();
    }, []);

    const loadProcessos = async () => {
        try {
            const response = await api.get('/processos');
            setProcessos(response.data);
        } catch (err) {
            setError('Erro ao carregar processos');
        }
    };

    const loadFluxos = async () => {
        try {
            const response = await api.get('/fluxos');
            setFluxos(response.data);
        } catch (err) {
            setError('Erro ao carregar fluxos');
        }
    };

    const handleOpen = (processo = null) => {
        if (processo) {
            setFormData({
                titulo: processo.titulo,
                descricao: processo.descricao,
                fluxo_id: processo.fluxo_id,
                documentos: processo.documentos
            });
            setEditingId(processo.id);
        } else {
            setFormData({
                titulo: '',
                descricao: '',
                fluxo_id: '',
                documentos: ''
            });
            setEditingId(null);
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setFormData({
            titulo: '',
            descricao: '',
            fluxo_id: '',
            documentos: ''
        });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/processos/${editingId}`, formData);
            } else {
                await api.post('/processos', formData);
            }
            handleClose();
            loadProcessos();
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao salvar processo');
        }
    };

    const handleAvancarEtapa = async (id) => {
        try {
            await api.post(`/processos/${id}/avancar-etapa`, {
                observacao: 'Etapa concluída'
            });
            loadProcessos();
        } catch (err) {
            setError('Erro ao avançar etapa');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Gestão de Processos</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                >
                    Novo Processo
                </Button>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Título</TableCell>
                            <TableCell>Descrição</TableCell>
                            <TableCell>Fluxo</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Etapa Atual</TableCell>
                            <TableCell>Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {processos.map((processo) => (
                            <TableRow key={processo.id}>
                                <TableCell>{processo.titulo}</TableCell>
                                <TableCell>{processo.descricao}</TableCell>
                                <TableCell>{processo.fluxos?.titulo}</TableCell>
                                <TableCell>{processo.status}</TableCell>
                                <TableCell>{processo.etapa_atual}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpen(processo)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleAvancarEtapa(processo.id)}>
                                        <PlayArrowIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingId ? 'Editar Processo' : 'Novo Processo'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Título"
                            name="titulo"
                            value={formData.titulo}
                            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Descrição"
                            name="descricao"
                            multiline
                            rows={4}
                            value={formData.descricao}
                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Fluxo</InputLabel>
                            <Select
                                value={formData.fluxo_id}
                                label="Fluxo"
                                onChange={(e) => setFormData({ ...formData, fluxo_id: e.target.value })}
                            >
                                {fluxos.map((fluxo) => (
                                    <MenuItem key={fluxo.id} value={fluxo.id}>
                                        {fluxo.titulo}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Documentos"
                            name="documentos"
                            multiline
                            rows={4}
                            value={formData.documentos}
                            onChange={(e) => setFormData({ ...formData, documentos: e.target.value })}
                            helperText="Liste os documentos necessários"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Processos;
