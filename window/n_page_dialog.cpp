#include "n_page_dialog.h"
#include "ui_n_page_dialog.h"

#include "util/n_json.h"
#include "util/n_util.h"
#include "n_project.h"

NPageDialog::NPageDialog(TYPE type, NJson &configPage, QWidget *parent) :
    QDialog(parent),
    ui(new Ui::NPageDialog),
    mConfigPage(configPage)
{
    ui->setupUi(this);

    mType = type;

    if (mType == TYPE_CREATE) {
        mPageIndex = configPage.length();
    }

    QStringList codeList = NProject::instance()->codes();
    ui->classFile->setList(codeList);

    QStringList layoutList = NProject::instance()->layouts();
    ui->layout->setList(layoutList);

    connect(ui->okButton, SIGNAL(clicked()), this, SLOT(updatePage()));
    connect(ui->cancelButton, SIGNAL(clicked()), this, SLOT(reject()));
    connect(ui->classFile, SIGNAL(currentTextChanged(QString)), this, SLOT(checkClassFile(QString)));
    connect(ui->layout, SIGNAL(currentTextChanged(QString)), this, SLOT(checkLayoutFile(QString)));
}

void NPageDialog::checkClassFile(const QString &path) {
    if (NProject::instance()->existsFile(path)) {
        ui->classFileLabel->setStyleSheet("");
    } else {
        ui->classFileLabel->setStyleSheet("QLabel { color: #ff0000; }");
    }
}

void NPageDialog::checkLayoutFile(const QString &path) {
    if (NProject::instance()->existsFile(path)) {
        ui->layoutLabel->setStyleSheet("");
    } else {
        ui->layoutLabel->setStyleSheet("QLabel { color: #ff0000; }");
    }
}

void NPageDialog::setPageId(const QString &pageId) {
    mPageIndex = mConfigPage.searchValue("id", pageId);
    NJson page = mConfigPage.getObject(QString::number(mPageIndex));

    ui->id->setText(page.getStr("id"));
    ui->className->setText(page.getStr("class"));
    ui->classFile->setCurrentText(page.getStr("classFile"));
    ui->layout->setCurrentText(page.getStr("extra.contentLayoutFile"));
    ui->backgroundColor->setText(page.getStr("backgroundColor"));
}

void NPageDialog::updatePage() {
    // id check
    QString pageId = ui->id->text();
    int pageIndex = mConfigPage.searchValue("id", pageId);
    int pageCount = mConfigPage.countValue("id", pageId);
    switch (mType) {
    case TYPE_CREATE:
        if (pageCount == 0) {
            break;
        }
        return;
    case TYPE_UPDATE:
        if (pageCount == 0) {
            break;
        }
        if (pageCount == 1 && pageIndex == mPageIndex) {
            break;
        }
        return;
    }

    // class check
    QString className = ui->className->text();
    if (className.isEmpty()) {
        return;
    }

    // class file check.
    QString classFile = ui->classFile->currentText();
    if (!NProject::instance()->existsFile(classFile)) {
        QString path = NProject::instance()->absoluteFilePath(classFile);
        QMap<QString, QString> replace;
        replace["{{class}}"] = className;
        if (!NUtil::createFileFromTemplate(":/template_code/page.js", path, replace)) {
            return;
        }
    }

    // layout check
    QString layoutFile = ui->layout->currentText();
    if (!NProject::instance()->existsFile(layoutFile)) {
        QString path = NProject::instance()->absoluteFilePath(layoutFile);
        if (!NUtil::createFileFromTemplate(":/template_code/layout.json", path)) {
            return;
        }
    }

    QString index = QString::number(mPageIndex);
    mConfigPage.set(index + ".id", pageId);
    mConfigPage.set(index + ".class", className);
    mConfigPage.set(index + ".classFile", classFile);
    mConfigPage.set(index + ".extra.contentLayoutFile", layoutFile);
    mConfigPage.set(index + ".backgroundColor", ui->backgroundColor->text());

    accept();
}

NPageDialog::~NPageDialog()
{
    delete ui;
}