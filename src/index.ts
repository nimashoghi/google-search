import {commands, ExtensionContext, Uri, window, workspace} from "vscode"

const getSelectionOrHighlight = () => {
    if (!window.activeTextEditor) {
        throw new Error("There is not active text editor!")
    }

    const selection = window.activeTextEditor.selection
    if (!selection.isEmpty) {
        return selection
    }

    return (
        window.activeTextEditor.document.getWordRangeAtPosition(
            selection.active,
        ) || selection
    )
}

const getSelectedText = () => {
    if (!window.activeTextEditor) {
        return ""
    }
    const document = window.activeTextEditor.document

    const text = document.getText()
    if (!text) {
        return ""
    }

    const {end, start} = getSelectionOrHighlight()
    return text
        .slice(document.offsetAt(start), document.offsetAt(end))
        .replace(/\s\s+/g, " ")
        .trim()
}

const createSearchUri = (query: string) => {
    const template =
        workspace.getConfiguration("google-search").get<string>("template") ||
        "https://www.google.com/search?q=%QUERY%"
    const url = template.replace("%QUERY%", encodeURI(query))
    return Uri.parse(url)
}

const getGoogleQuery = async () =>
    await window.showInputBox({
        ignoreFocusOut: false,
        prompt: "Please enter your Google query.",
        placeHolder: "Google query...",
        value: getSelectedText(),
    })

const search = async () => {
    const input = await getGoogleQuery()
    if (!input) {
        await window.setStatusBarMessage(
            "You must provide a search query!",
            2500,
        )
        return
    }
    await commands.executeCommand("vscode.open", createSearchUri(input))
    await window.setStatusBarMessage(`Searching "${input}" on Google...`, 2500)
}

export const activate = (context: ExtensionContext) => {
    context.subscriptions.push(
        commands.registerTextEditorCommand("google-search.search", search),
    )
}

export const deactivate = () => {}
