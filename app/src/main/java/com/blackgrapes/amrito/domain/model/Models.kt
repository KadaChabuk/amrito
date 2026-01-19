package com.blackgrapes.amrito.domain.model

data class Book(
    val id: String,
    val title: String,
    val author: String,
    val coverImageUrl: String?,
    val pages: List<Page>,
    val tableOfContents: List<ChapterInfo>
)

data class Page(
    val number: Int,
    val content: String,
    val chapter: Int,
    val isRightPage: Boolean // true if this is a right-side page in the spread
)

data class ChapterInfo(
    val id: Int,
    val title: String,
    val startPage: Int,
    val endPage: Int
)

data class TextSelection(
    val pageNumber: Int,
    val startOffset: Int,
    val endOffset: Int,
    val selectedText: String
)