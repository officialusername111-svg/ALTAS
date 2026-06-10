$(function () {
    set_active_sidebar('.archive-nav');

    const CONFIG = {
        endpoints: {
            getArchiveDocuments: '/ArchiveDocument/getArchiveDocuments',
            saveArchiveDocuments: '/ArchiveDocument/saveArchiveDocuments'
        },
        selectors: {
            divArchiveDocument: '#divArchiveDocument',
            tblArchiveDocument: '#tblArchiveDocument',
            searchArchiveDocumentInput: '#searchArchiveDocumentInput',
            btnSaveArchiveDocument: '#btnSaveArchiveDocument',
            btnClearArchiveDocument: '#btnClearArchiveDocument',

            ArchiveCategoryId: '#ArchiveCategoryId',


            divUploadDocument: '#divUploadDocument',
            fileInput: '#fileInput',
            inpFileName: '#inpFileName',
            documentIcon: '#documentIcon',
            documentSize: '#documentSize',
            previewContent: '#previewContent',

            hidFileURL: '#_hidFileURL',
            btnPreviewDocument: '#btnPreviewDocument',
            previewModal: '#previewModal'
        }
    };

    let selectedFile = null;

    fnLoadArchiveDocument();
    attachEventHandlers();
    function attachEventHandlers() {
        $(document)
            .on('input', CONFIG.selectors.searchArchiveDocumentInput, debounce(fnLoadArchiveDocument, 250))

            .on('click', CONFIG.selectors.btnClearArchiveDocument, handleClearArchiveDocument)
            .on('click', CONFIG.selectors.btnSaveArchiveDocument, handleSaveArchiveDocument)
            .on('click', `${CONFIG.selectors.tblArchiveDocument} .btn-edit`, handleSelectArchiveDocument)

            .on('click', CONFIG.selectors.divUploadDocument, handleUploadClick)
            .on('click', CONFIG.selectors.fileInput, handleFileInputClick)
            .on('change', CONFIG.selectors.fileInput, handleFileSelect)

            .on('click', CONFIG.selectors.btnPreviewDocument, handlePreviewDocument)

            .on('dragenter dragover', CONFIG.selectors.divUploadDocument, handleUploadAddClass)
            .on('dragleave', CONFIG.selectors.divUploadDocument, handleUploadRemoveClass)
            .on('drop', CONFIG.selectors.divUploadDocument, handleFileDrop)
    }


    function fnLoadArchiveDocument() {
        const search = $(CONFIG.selectors.searchArchiveDocumentInput).val();
        doAjax(CONFIG.endpoints.getArchiveDocuments, 'GET', { searchKeyword: search }).then(res => {
            resetDataTable(CONFIG.selectors.tblArchiveDocument);

            $(CONFIG.selectors.tblArchiveDocument).DataTable({
                retrieve: true, searching: false, lengthMenu: [10], order: [], "dom": 'rtip', data: res,
                pagingType: "full_numbers", language: returnPagination(),
                columns: [
                    { title: "CategoryName", data: 'CategoryName', visible: true, className: 'dt-start', orderable: false, width: '70px' },
                    { title: "Title", data: 'OrdResoTitle', visible: true, className: 'dt-start', orderable: false, width: '175px' },
                    { title: "Subject", data: 'OrdResoSubject', visible: true, className: 'dt-start', orderable: false },
                    { title: "File Name", data: 'FileName', className: 'dt-start', orderable: false },
                    {
                        title: "Date Archive", data: 'DateArchive', className: 'dt-center', orderable: false, width: '100px',
                        render: d => parseMSDate4DTable(d)
                    },
                    {
                        title: "Action", data: null, className: 'dt-center', width: '70px', orderable: false,
                        render: function (data, type, row) {
                            return `<button class="btn btn-main-outline btn-outline-secondary ms-1 btn-sm btn-edit"> Edit <span class="icon-edit icon-md ms-1"></span></button>`;
                        }
                    }
                ]
            });
        });
    }

    function handleClearArchiveDocument() {
        clearContent(CONFIG.selectors.divArchiveDocument);
        $(CONFIG.selectors.divUploadDocument).find('h6').text('Drag & Drop your document here or click to upload');
        $(CONFIG.selectors.previewContent).empty();
        $(CONFIG.selectors.previewContent).append(`<p>No preview available for this file type.</p>`);
    }

    function handleSelectArchiveDocument() {
        const data = getSelectedRowData(this, CONFIG.selectors.tblArchiveDocument);
        setValues(CONFIG.selectors.divArchiveDocument, data);
        /*$(CONFIG.selectors.hidFileURL).val(data.FileLocation);*/
        $(CONFIG.selectors.previewContent).empty();
        selectedFile = null
    }

    function handlePreviewDocument() {
        const fileurl = $(CONFIG.selectors.hidFileURL).val();
        if (fileurl !== '' && !selectedFile) {
            previewDocument(fileurl);
        }
        else {
            $(CONFIG.selectors.previewModal).modal('show');
        }
    }


    function handleSaveArchiveDocument() {
        if (!selectedFile) {
            showToast('Please select a file first', 'warning');
            return;
        }

        // Create FormData and append file
        const formData = new FormData();
        formData.append('file', selectedFile);

        // Append DTO properties dynamically
        const data = getValues(CONFIG.selectors.divArchiveDocument);

        console.log(data);
        for (const key in data) {
            formData.append(key, data[key]);
        }
        formData.append( 'CategoryName', $(CONFIG.selectors.ArchiveCategoryId + ' option:selected').text() );


        doAjax(CONFIG.endpoints.saveArchiveDocuments, 'POST', formData)
            .then(res => {
                if (res && res.rtn.success === true) {
                    showToast('Successfully saved archive documents.', 'success');
                    fnLoadArchiveDocument();
                    handleClearArchiveDocument();
                    selectedFile = null;
                    handleFiles(null);
                } else {
                    showToast(res.rtn.remarks, 'danger');
                }
            })
            .catch(error => {
                console.error('Error saving archive documents:', error);
                showToast('Failed to saved archive documents', 'danger');
            });
    }



    function handleUploadClick(e) {
        e.preventDefault();
        $(CONFIG.selectors.fileInput)[0].click();;
    }   
    function handleFileInputClick(e) {
        e.stopPropagation();
    }

    function handleFileSelect(e) {
        handleFiles(e.target.files);
    }



    function handleFiles(files) {
        if (!files || files.length === 0) return;

        selectedFile = files[0];


        $(CONFIG.selectors.divUploadDocument).find('h6').text(selectedFile.name);
        $(CONFIG.selectors.inpFileName).val(selectedFile.name);

        $(CONFIG.selectors.documentIcon).removeClass('icon-upload icon-file');
        $(CONFIG.selectors.documentSize).text('');

        if (selectedFile.type.startsWith('image/')) {
            $(CONFIG.selectors.documentIcon).addClass('icon-image');
            $(CONFIG.selectors.documentSize).text(formatFileSize(selectedFile.size)).removeClass('d-none');
        }
        else if (selectedFile.type.startsWith('text/')) {
            $(CONFIG.selectors.documentIcon).addClass('icon-text');
            $(CONFIG.selectors.documentSize).text(formatFileSize(selectedFile.size)).removeClass('d-none');
        }
        else if (selectedFile.type === 'application/pdf') {
            $(CONFIG.selectors.documentIcon).addClass('icon-file');
            $(CONFIG.selectors.documentSize).text(formatFileSize(selectedFile.size)).removeClass('d-none');
        } else {
            $(CONFIG.selectors.documentIcon).addClass('icon-upload');
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            $(CONFIG.selectors.previewContent).empty();

            if (selectedFile.type === 'application/pdf') {
                $(CONFIG.selectors.previewContent).append(`<iframe src="${e.target.result}" style="width:100%; height:650px;" frameborder="0"></iframe>`);
            } else if (selectedFile.type.startsWith('image/')) {
                $(CONFIG.selectors.previewContent).append(`<img src="${e.target.result}" style="max-width:100%; max-height:650px;" />`);
            } else {
                $(CONFIG.selectors.previewContent).append(`<p>No preview available for this file type.</p>`);
            }
        };
        reader.readAsDataURL(selectedFile);
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));

        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    }

    function handleUploadAddClass(e) {
        e.preventDefault();
        e.stopPropagation();
        $(CONFIG.selectors.divUploadDocument).addClass('border-primary bg-light'); 
    }
    function handleUploadRemoveClass(e) {
        e.preventDefault();
        e.stopPropagation();
        $(CONFIG.selectors.divUploadDocument).removeClass('border-primary bg-light');
    }
    function handleFileDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        $(CONFIG.selectors.divUploadDocument).removeClass('border-primary bg-light');

        const files = e.originalEvent.dataTransfer.files;
        handleFiles(files);
    }

    function previewDocument(fileUrl) {
        const previewContent = $(CONFIG.selectors.previewContent);
        previewContent.empty();

        if (fileUrl.endsWith('.pdf')) {
            previewContent.append(`
        <iframe src="${fileUrl}" style="width:100%; height:650px;" frameborder="0"></iframe>
    `);
        } else if (fileUrl.match(/\.(jpg|jpeg|png|gif)$/i)) {
            previewContent.append(`
        <img src="${fileUrl}" style="max-width:100%; max-height:650px;" />
    `);
        } else {
            previewContent.append(`<p>No preview available.</p>`);
        }

        $(CONFIG.selectors.previewModal).modal('show');
    }
});


