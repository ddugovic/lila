package lila.ublog

import bloomfilter.mutable.BloomFilter
import scala.concurrent.duration.*
import scala.concurrent.ExecutionContext

import lila.common.IpAddress
import lila.db.dsl.{ *, given }

final class UblogViewCounter(colls: UblogColls)(using ec: ExecutionContext):

  private val bloomFilter = BloomFilter[String](
    numberOfItems = 200_000,
    falsePositiveRate = 0.001
  )

  def apply(post: UblogPost, ip: IpAddress): UblogPost =
    if (post.live) post.copy(views = {
      val key = s"${post.id}:${ip.value}"
      if (bloomFilter mightContain key) post.views
      else {
        bloomFilter.add(key)
        lila.mon.ublog.view(post.created.by.value).increment()
        colls.post.incFieldUnchecked($id(post.id), "views")
        UblogPost.Views(post.views.value + 1)
      }
    })
    else post