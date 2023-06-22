export default (swaggerHeaderLogo) => {
    return `.swagger-ui .url { display: none } 
    .swagger-ui .opblock.opblock-get .opblock-summary-method {
        background-color: #1391FF;
    }
    .swagger-ui .opblock.opblock-get .opblock-summary-method {
        background: #1391FF;
    }
    .swagger-ui .opblock.opblock-put .opblock-summary-method {
        background-color: #E97500;
    }
    
    .swagger-ui .opblock.opblock-put .opblock-summary-method {
        background-color: #E97500;
    }
    .swagger-ui .opblock.opblock-put .opblock-summary-method {
        background: #E97500;
    }
    .swagger-ui .opblock.opblock-delete .opblock-summary-method {
        background-color: #CF3030;
    }
    
    .swagger-ui .opblock.opblock-delete .opblock-summary-method {
        background: #CF3030;
    }
    .swagger-ui .opblock.opblock-post .opblock-summary-method {
        background-color: #009D77;
    }
    
    .swagger-ui .opblock.opblock-post .opblock-summary-method {
        background: #009D77;
    }
    .swagger-ui .opblock.opblock-patch .opblock-summary-method {
        background-color: #00A0A7;
    }
    
    .swagger-ui .opblock.opblock-patch .opblock-summary-method {
        background: #00A0A7;
    }
    
    .swagger-ui img {
        content: url(${swaggerHeaderLogo}/img/soluM_logo.svg);     
    }
    
    .swagger-ui .topbar {
        background-color: #09263F;
        padding: 10px 0;
    }
    
    .swagger-ui .topbar .download-url-wrapper .select-label select {
        border: 2px solid #09263F;
        box-shadow: none;
        flex: 2;
        outline: none;
        width: 100%;
    }
    
    .swagger-ui .info .title {
        color: #09263F;
        font-family: sans-serif;
        font-size: 36px;
        margin: 0;
    }
    
    .swagger-ui .info .title small {
        background: #09263F;
        border-radius: 57px;
        display: inline-block;
        font-size: 10px;
        margin: 0 0 0 5px;
        padding: 2px 4px;
        position: relative;
        top: -5px;
        vertical-align: super;
    }
    
    .swagger-ui .info .title small.version-stamp {
        background-color: #6497D2;
    }
    
    .swagger-ui .btn.authorize {
        background-color: transparent;
        border-color: #6497D2;
        color: #6497D2;
        display: inline;
        line-height: 1;
    }
    .swagger-ui .btn.authorize svg {
        fill: #6497D2;
    }
    
    .swagger-ui .dialog-ux .modal-ux-content h4 {
        // visibility: hidden;
        position: relative;
        display: none;
    }
    // .swagger-ui .dialog-ux .modal-ux-content h4:after {
    //     content: "Timestamp";
        
    //     position: absolute;
    //     visibility: visible;
    //     left: 0px;
    // }
    
    .swagger-ui .dialog-ux .modal-ux-content p {
        color: #41444e;
        color: #3b4151;
        font-family: sans-serif;
        font-size: 17px;
        margin: 0 0 5px;
    }
    
    
    .swagger-ui .dialog-ux .modal-ux-content .wrapper label {
        position:relative;
        visibility:hidden;
    }
    .swagger-ui .dialog-ux .modal-ux-content .wrapper label:after {
        content: "Value:";
        visibility: visible;
        left: 0;
        position: absolute;
        width: 100px;
    }
    
    .swagger-ui .opblock-body pre.microlight {
        word-wrap: break-word;
        background: #09263F !important;
        border-radius: 4px;
        color: #fff;
        font-family: monospace;
        font-size: 12px;
        font-weight: 600;
        -webkit-hyphens: auto;
        -ms-hyphens: auto;
        hyphens: auto;
        margin: 0;
        padding: 10px;
        white-space: pre-wrap;
        word-break: break-all;
        word-break: break-word;
    }
    
    table.responses-table.live-responses-table td.response-col_description div:nth-child(1) .microlight {
        background-color: #000000 !important;
        margin-right:85px !important;
    }
    
    table.responses-table.live-responses-table td.response-col_description div:nth-child(2) .microlight {
        background-color: #000000 !important;
        margin-right:85px !important;
    }
    
    table.responses-table.live-responses-table td.response-col_description div:nth-child(3) .microlight {
        background-color: #000000 !important;
        margin-right:85px !important;
    }
    
    .swagger-ui .curl-command .curl.microlight{
        background-color: #000000 !important;
        margin-left: 85px !important;
        margin-right:85px !important;
    }
    
    
    .swagger-ui .opblock-body .request-url .microlight{
        background-color: #000000 !important;
        margin-left: 85px !important;
        margin-right:85px !important;
    }
    
    .swagger-ui .curl-command .copy-to-clipboard {
        bottom: 5px;
        height: 20px;
        right: 10px;
        width: 20px;
        margin-right: 85px !important;
    }
    
    .swagger-ui .copy-to-clipboard {
        background: #7d8293;
        border: none;
        border-radius: 4px;
        bottom: 10px;
        height: 30px;
        position: absolute;
        right: 100px;
        width: 30px;
        margin-right: 85px;
    }
    
    .swagger-ui .download-contents {
        background: #7d8293;
        border-radius: 4px;
        bottom: 10px;
        color: #fff;
        cursor: pointer;
        font-family: sans-serif;
        font-size: 14px;
        font-weight: 600;
        height: 30px;
        padding: 5px;
        position: absolute;
        right: 10px;
        text-align: center;
        margin-right:85px;
    }
    
    .swagger-ui .curl-command h4 {
        padding-left: 85px;
    }
    
    .swagger-ui .responses-inner div h4{
        padding-left:85px;
    }
    
    .swagger-ui .opblock-description-wrapper, .swagger-ui .opblock-external-docs-wrapper, .swagger-ui .opblock-title_normal {
        color: #3b4151;
        font-family: sans-serif;
        font-size: 12px;
        margin: 0 0 5px;
        padding: 15px 20px;
        margin-left: 85px;
        margin-right: 85px;
    }
    
    .swagger-ui .execute-wrapper {
        padding: 20px;
        text-align: right;
        margin-left: 85px;
        margin-right: 85px;
    }
    
    .swagger-ui .btn-group {
        display: flex;
        padding: 30px;
        margin-left: 85px;
        margin-right: 85px;
    }
    
    .swagger-ui .servers-title  {
        visibility: hidden;
        position: relative;
    }
    .swagger-ui .servers-title:after {
        content: "Base Path";
    
        position: absolute;
        visibility: visible;
        width: 100px;
        left:0px;
    }
    
    `   
}