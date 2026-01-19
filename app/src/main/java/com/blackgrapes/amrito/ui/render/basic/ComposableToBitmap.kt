package com.blackgrapes.amrito.ui.util

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.view.View
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.ComposeView

fun renderComposableToBitmap(
    context: Context,
    width: Int,
    height: Int,
    content: @Composable () -> Unit
): Bitmap {
    val composeView = ComposeView(context).apply {
        setContent(content)
    }

    composeView.measure(
        View.MeasureSpec.makeMeasureSpec(width, View.MeasureSpec.EXACTLY),
        View.MeasureSpec.makeMeasureSpec(height, View.MeasureSpec.EXACTLY)
    )
    composeView.layout(0, 0, width, height)

    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)
    composeView.draw(canvas)

    return bitmap
}