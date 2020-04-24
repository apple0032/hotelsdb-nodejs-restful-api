//************** Swagger JSON format structure **************//

/**
* @swagger

    "/hotel/list": {
        "get": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "List out all hotel records",
            "description": "Retrieve all hotel data from database by only offset/limit",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "description": "limit number of records",
                    "type": "integer",
                    "name": "limit",
                    "in": "query"
                },
                {
                    "description": "offset number of records",
                    "type": "integer",
                    "name": "offset",
                    "in": "query"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "total": 1,
                            "offset": 0,
                            "limit": 1,
                            "data": [
                                {
                                    "id": 40,
                                    "name": "The Peninsula Hong Kong",
                                    "star": 5,
                                    "phone": 23698741,
                                    "category_id": 9,
                                    "default_image": "19912",
                                    "image": "1544966763.jpg",
                                    "body": "rich hotel",
                                    "coordi_x": "22.295077",
                                    "coordi_y": "114.171799",
                                    "new": 0,
                                    "handling_price": 25,
                                    "created_at": "2018-12-16 20:00:00",
                                    "updated_at": "2019-01-08 22:37:52",
                                    "soft_delete": 0
                                }
                            ]
                        }
                    }
                }
            }
        }
    }


    "/hotel/{hotel_id}": {
        "get": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "List out a hotel record by ID",
            "description": "Retrieve a hotel data from database by ID",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "required": true,
                    "description": "id of hotel",
                    "type": "integer",
                    "name": "hotel_id",
                    "in": "path"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "data": [
                                {
                                    "id": 40,
                                    "name": "The Peninsula Hong Kong",
                                    "star": 5,
                                    "phone": 23698741,
                                    "category_id": 9,
                                    "default_image": "19912",
                                    "image": "1544966763.jpg",
                                    "body": "rich hotel",
                                    "coordi_x": "22.295077",
                                    "coordi_y": "114.171799",
                                    "new": 0,
                                    "handling_price": 25,
                                    "created_at": "2018-12-16 20:00:00",
                                    "updated_at": "2019-01-08 22:37:52",
                                    "soft_delete": 0
                                }
                            ]
                        }
                    }
                }
            }
        }
    }


    "/hotel/comment/{hotel_id}": {
        "get": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "List out all comments of a hotel by hotel ID",
            "description": "Retrieve all comments of a hotel by hotel ID",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "required": true,
                    "description": "id of hotel",
                    "type": "integer",
                    "name": "hotel_id",
                    "in": "path"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "data": [
                                {
                                    "id": 7,
                                    "hotel_id": 40,
                                    "user_id": 5,
                                    "comment": "Great hotel ! Thank for the services.",
                                    "star": 4.5,
                                    "status": 1,
                                    "created_at": "2018-12-27 23:16:19",
                                    "updated_at": "2018-12-27 23:16:19"
                                },
                                {
                                    "id": 13,
                                    "hotel_id": 40,
                                    "user_id": 2,
                                    "comment": "fix bug",
                                    "star": 5,
                                    "status": 1,
                                    "created_at": "2019-01-07 00:43:23",
                                    "updated_at": "2019-01-07 00:43:23"
                                }
                            ]
                        }
                    }
                }
            }
        },

        "post": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "Post a comment of a hotel by hotel ID",
            "description": "Post a comment of a hotel by hotel ID",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "required": true,
                    "description": "id of hotel",
                    "type": "integer",
                    "name": "hotel_id",
                    "in": "path"
                },
                {
                    "required": true,
                    "description": "id of user",
                    "type": "integer",
                    "name": "user_id",
                    "in": "formData"
                },
                {
                    "required": true,
                    "description": "Pure string format",
                    "type": "string",
                    "name": "comment",
                    "in": "formData"
                },
                {
                    "required": true,
                    "description": "Star value of the hotel",
                    "type": "number",
                    "name": "star",
                    "in": "formData"
                },
                {
                    "required": true,
                    "description": "Default is active",
                    "type": "integer",
                    "name": "status",
                    "in": "formData",
                    "default" : "1"
                },
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "id": 22,
                            "hotel_id": "40",
                            "user_id": "1",
                            "comment": "testing",
                            "star": "3.5",
                            "status": "1",
                            "created_at": "2020-04-23 14:54:53",
                            "updated_at": "2020-04-23 14:54:53"
                        }
                    }
                }
            }
        }
    }



    "/hotel/room/{hotel_id}": {
        "get": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "List out all rooms by hotel ID",
            "description": "List out all rooms by hotel ID",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "required": true,
                    "description": "id of hotel",
                    "type": "integer",
                    "name": "hotel_id",
                    "in": "path"
                },
                {
                    "description": "Default is active",
                    "type": "integer",
                    "name": "status",
                    "in": "formData",
                    "default" : "1"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "hotel_id" : "41",
                            "data": [
                                {
                                    "id": 23,
                                    "hotel_id": 41,
                                    "room_type_id": 1,
                                    "ppl_limit": 5,
                                    "price": 1000,
                                    "qty": 30,
                                    "availability": 1,
                                    "promo": 0,
                                    "created_at": "2018-12-16 22:37:28",
                                    "updated_at": "2018-12-16 22:37:28",
                                    "room_type": {
                                        "id": 1,
                                        "type": "普通房",
                                        "created_at": "0000-00-00 00:00:00",
                                        "updated_at": "0000-00-00 00:00:00"
                                    }
                                },
                                {
                                    "id": 24,
                                    "hotel_id": 41,
                                    "room_type_id": 2,
                                    "ppl_limit": 4,
                                    "price": 2000,
                                    "qty": 50,
                                    "availability": 1,
                                    "promo": 1,
                                    "created_at": "2018-12-16 22:37:43",
                                    "updated_at": "2018-12-16 22:37:43",
                                    "room_type": {
                                        "id": 2,
                                        "type": "高級房",
                                        "created_at": "0000-00-00 00:00:00",
                                        "updated_at": "0000-00-00 00:00:00"
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        }
    }




    "/hotel/search/normal": {
        "post": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "HotelsDB searching engine",
            "description": "Normal and basic searching",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "description": "limit number of records",
                    "type": "integer",
                    "name": "limit",
                    "in": "formData"
                },
                {
                    "description": "offset number of records",
                    "type": "integer",
                    "name": "offset",
                    "in": "formData"
                },
                {
                    "description": "hotel name",
                    "type": "string",
                    "name": "name",
                    "in": "formData"
                },
                {
                    "description": "category ID",
                    "type": "string",
                    "name": "category_id",
                    "in": "formData"
                },
                {
                    "description": "star of hotel",
                    "type": "integer",
                    "name": "star",
                    "in": "formData"
                },
                {
                    "description": "room type ID of hotel",
                    "type": "integer",
                    "name": "room_type",
                    "in": "formData"
                },
                {
                    "description": "people limit number of a room of a hotel",
                    "type": "integer",
                    "name": "ppl_limit",
                    "in": "formData"
                },
                {
                    "description": "the expected lower price of room",
                    "type": "string",
                    "name": "price_low",
                    "in": "formData"
                },
                {
                    "description": "the expected upper price of room",
                    "type": "string",
                    "name": "price_up",
                    "in": "formData"
                },
                {
                    "description": "tag id of the hotel",
                    "type": "integer",
                    "name": "tag_id",
                    "in": "formData"
                },
                {
                    "description": "the expected time to start",
                    "type": "string",
                    "name": "start",
                    "in": "formData"
                },
                {
                    "description": "the expected time to end",
                    "type": "string",
                    "name": "end",
                    "in": "formData"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "total": 1,
                            "data": [
                                {
                                    "id": 40,
                                    "name": "The Peninsula Hong Kong",
                                    "star": 5,
                                    "phone": 23698741,
                                    "category_id": 9,
                                    "default_image": "19912",
                                    "image": "1544966763.jpg",
                                    "coordi_x": "          22.295077          ",
                                    "coordi_y": "          114.171799          ",
                                    "new": 0,
                                    "handling_price": 25,
                                    "created_at": "2018-12-16 20:00:00",
                                    "updated_at": "2019-01-08 22:37:52",
                                    "soft_delete": 0,
                                    "hotel_rooms": [
                                        {
                                            "id": 20,
                                            "hotel_id": 40,
                                            "room_type_id": 1,
                                            "ppl_limit": 2,
                                            "price": 500,
                                            "qty": 50,
                                            "availability": 1,
                                            "promo": 0,
                                            "created_at": "2018-12-16 22:36:07",
                                            "updated_at": "2018-12-16 22:36:07"
                                        },
                                        {
                                            "id": 21,
                                            "hotel_id": 40,
                                            "room_type_id": 2,
                                            "ppl_limit": 3,
                                            "price": 1500,
                                            "qty": 20,
                                            "availability": 1,
                                            "promo": 1,
                                            "created_at": "2018-12-16 22:36:20",
                                            "updated_at": "2018-12-16 22:36:20"
                                        },
                                        {
                                            "id": 22,
                                            "hotel_id": 40,
                                            "room_type_id": 3,
                                            "ppl_limit": 5,
                                            "price": 3000,
                                            "qty": 3,
                                            "availability": 1,
                                            "promo": 0,
                                            "created_at": "2018-12-16 22:36:46",
                                            "updated_at": "2018-12-16 22:36:46"
                                        }
                                    ],
                                    "tags": [
                                        {
                                            "id": 3,
                                            "name": "best hotel",
                                            "created_at": "2018-11-06 06:34:34",
                                            "updated_at": "2018-11-06 06:34:34",
                                            "post_tag": {
                                                "id": 406,
                                                "hotel_id": 40,
                                                "tag_id": 3,
                                                "created_at": "2019-01-08 22:37:52",
                                                "updated_at": "2019-01-08 22:37:52"
                                            }
                                        },
                                        {
                                            "id": 5,
                                            "name": "enjoy",
                                            "created_at": "2018-11-18 17:17:35",
                                            "updated_at": "2018-11-18 17:17:35",
                                            "post_tag": {
                                                "id": 407,
                                                "hotel_id": 40,
                                                "tag_id": 5,
                                                "created_at": "2019-01-08 22:37:52",
                                                "updated_at": "2019-01-08 22:37:52"
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
            }
        }
    }



    "/hotel/booking/validate": {
        "get": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "Validate the booking status of a hotel",
            "description": "This API return all rooms and its booking status of a hotel",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "description": "id of hotel",
                    "required": true,
                    "type": "integer",
                    "name": "hotel_id",
                    "in": "query"
                },
                {
                    "description": "the expected time to start",
                    "required": true,
                    "type": "string",
                    "name": "start",
                    "in": "query"
                },
                {
                    "description": "the expected time to end",
                    "required": true,
                    "type": "string",
                    "name": "end",
                    "in": "query"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "start": "2020-04-23",
                            "end": "2020-04-24",
                            "hotel_id": 40,
                            "rooms": [
                                {
                                    "id": 20,
                                    "qty": 50
                                },
                                {
                                    "id": 21,
                                    "qty": 20
                                },
                                {
                                    "id": 22,
                                    "qty": 3
                                }
                            ],
                            "valid_room": [
                                {
                                    "date": "2020-04-23",
                                    "room": 20,
                                    "qty": 50,
                                    "count": 0
                                },
                                {
                                    "date": "2020-04-23",
                                    "room": 21,
                                    "qty": 20,
                                    "count": 0
                                },
                                {
                                    "date": "2020-04-23",
                                    "room": 22,
                                    "qty": 3,
                                    "count": 0
                                },
                                {
                                    "date": "2020-04-24",
                                    "room": 20,
                                    "qty": 50,
                                    "count": 0
                                },
                                {
                                    "date": "2020-04-24",
                                    "room": 21,
                                    "qty": 20,
                                    "count": 0
                                },
                                {
                                    "date": "2020-04-24",
                                    "room": 22,
                                    "qty": 3,
                                    "count": 0
                                }
                            ],
                            "invalid_room": [],
                            "availabitiy": true
                        }
                    }
                }
            }
        }
    }


    "/hotel/booking/status": {
        "get": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "List out all bookings status of a hotel by hotel ID",
            "description": "List out all bookings status of a hotel by hotel ID",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "description": "id of hotel",
                    "required": true,
                    "type": "integer",
                    "name": "hotel_id",
                    "in": "query"
                },
                {
                    "description": "the expected time to start",
                    "required": true,
                    "type": "string",
                    "name": "start",
                    "in": "query"
                },
                {
                    "description": "the expected time to end",
                    "required": true,
                    "type": "string",
                    "name": "end",
                    "in": "query"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "start": "2018-12-23",
                            "end": "2019-12-31",
                            "hotel_id": "40",
                            "total": 11,
                            "booking": [
                                {
                                    "id": 76,
                                    "user_id": 11,
                                    "hotel_id": 40,
                                    "hotel_room_id": 22,
                                    "people": 2,
                                    "in_date": "2018-12-27 00:00:00",
                                    "out_date": "2018-12-31 00:00:00",
                                    "book_date": "2018-12-27 21:50:59",
                                    "total_price": 12025,
                                    "payment_method_id": 1,
                                    "approved": 1,
                                    "status": 1,
                                    "created_at": "2018-12-27 21:50:59",
                                    "updated_at": "2018-12-27 21:50:59",
                                    "hotel_room": {
                                        "id": 22,
                                        "hotel_id": 40,
                                        "room_type_id": 3,
                                        "ppl_limit": 5,
                                        "price": 3000,
                                        "qty": 3,
                                        "availability": 1,
                                        "promo": 0,
                                        "created_at": "2018-12-16 22:36:46",
                                        "updated_at": "2018-12-16 22:36:46",
                                        "room_type": {
                                            "id": 3,
                                            "type": "總統套房",
                                            "created_at": "0000-00-00 00:00:00",
                                            "updated_at": "0000-00-00 00:00:00"
                                        }
                                    },
                                    "payment_method": {
                                        "id": 1,
                                        "type": "VISA"
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        }
    }




    "/hotel/booking/{user_id}": {
        "get": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "List out all bookings status of a user by user ID",
            "description": "List out all bookings status of a user by user ID",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "required": true,
                    "description": "id of user",
                    "type": "integer",
                    "name": "user_id",
                    "in": "path"
                },
                {
                    "description": "id of hotel",
                    "type": "integer",
                    "name": "hotel_id",
                    "in": "query"
                },
                {
                    "description": "the expected time to start",
                    "type": "string",
                    "name": "start",
                    "in": "query"
                },
                {
                    "description": "the expected time to end",
                    "type": "string",
                    "name": "end",
                    "in": "query"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "hotel_id": "40",
                            "total": 1,
                            "booking": [
                                {
                                    "id": 76,
                                    "user_id": 11,
                                    "hotel_id": 40,
                                    "hotel_room_id": 22,
                                    "people": 2,
                                    "in_date": "2018-12-27 00:00:00",
                                    "out_date": "2018-12-31 00:00:00",
                                    "book_date": "2018-12-27 21:50:59",
                                    "total_price": 12025,
                                    "payment_method_id": 1,
                                    "approved": 1,
                                    "status": 1,
                                    "created_at": "2018-12-27 21:50:59",
                                    "updated_at": "2018-12-27 21:50:59",
                                    "hotel_room": {
                                        "id": 22,
                                        "hotel_id": 40,
                                        "room_type_id": 3,
                                        "ppl_limit": 5,
                                        "price": 3000,
                                        "qty": 3,
                                        "availability": 1,
                                        "promo": 0,
                                        "created_at": "2018-12-16 22:36:46",
                                        "updated_at": "2018-12-16 22:36:46",
                                        "room_type": {
                                            "id": 3,
                                            "type": "總統套房",
                                            "created_at": "0000-00-00 00:00:00",
                                            "updated_at": "0000-00-00 00:00:00"
                                        }
                                    },
                                    "payment_method": {
                                        "id": 1,
                                        "type": "VISA"
                                    },
                                    "hotel": {
                                        "id": 40,
                                        "name": "The Peninsula Hong Kong"
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        }
    }






    "/hotel/booking/details/{book_id}": {
        "get": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "List out a booking details by booking ID",
            "description": "List out a booking details by booking ID",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "required": true,
                    "description": "id of booking object",
                    "type": "integer",
                    "name": "book_id",
                    "in": "path"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "bookng_id": "76",
                            "details": {
                                "id": 76,
                                "user_id": 11,
                                "hotel_id": 40,
                                "hotel_room_id": 22,
                                "people": 2,
                                "in_date": "2018-12-27 00:00:00",
                                "out_date": "2018-12-31 00:00:00",
                                "book_date": "2018-12-27 21:50:59",
                                "total_price": 12025,
                                "payment_method_id": 1,
                                "approved": 1,
                                "status": 1,
                                "created_at": "2018-12-27 21:50:59",
                                "updated_at": "2018-12-27 21:50:59",
                                "hotel_room": {
                                    "id": 22,
                                    "hotel_id": 40,
                                    "room_type_id": 3,
                                    "ppl_limit": 5,
                                    "price": 3000,
                                    "qty": 3,
                                    "availability": 1,
                                    "promo": 0,
                                    "created_at": "2018-12-16 22:36:46",
                                    "updated_at": "2018-12-16 22:36:46",
                                    "room_type": {
                                        "id": 3,
                                        "type": "總統套房",
                                        "created_at": "0000-00-00 00:00:00",
                                        "updated_at": "0000-00-00 00:00:00"
                                    }
                                },
                                "user": {
                                    "id": 11,
                                    "name": "dada",
                                    "email": "dada@gmail.com",
                                    "phone": "98765432",
                                    "gender": "F",
                                    "role": "user",
                                    "profile_image": null,
                                    "profile_banner": null,
                                    "profile_desc": null,
                                    "created_at": "2018-12-26 21:00:21",
                                    "updated_at": "2018-12-28 20:34:12"
                                },
                                "hotel": {
                                    "id": 40,
                                    "name": "The Peninsula Hong Kong",
                                    "star": 5,
                                    "phone": 23698741,
                                    "category_id": 9,
                                    "default_image": "19912",
                                    "image": "1544966763.jpg",
                                    "coordi_x": "          22.295077          ",
                                    "coordi_y": "          114.171799          ",
                                    "new": 0,
                                    "handling_price": 25,
                                    "created_at": "2018-12-16 20:00:00",
                                    "updated_at": "2019-01-08 22:37:52",
                                    "soft_delete": 0
                                },
                                "payment_method": {
                                    "id": 1,
                                    "type": "VISA"
                                },
                                "booking_payment": {
                                    "id": 56,
                                    "booking_id": 76,
                                    "user_id": 11,
                                    "single_price": 3000,
                                    "handling_price": 25,
                                    "total_price": 12025,
                                    "payment_method_id": 1,
                                    "card_number": 2147483647,
                                    "expired_date": "2020-10",
                                    "security_number": 987,
                                    "status": 1
                                },
                                "booking_guests": [
                                    {
                                        "id": 47,
                                        "booking_id": 76,
                                        "name": "fufu",
                                        "phone": 98765432,
                                        "gender": "F",
                                        "email": "fu@gmail.com",
                                        "created_at": "2018-12-27 21:50:59",
                                        "updated_at": "2018-12-27 21:50:59"
                                    },
                                    {
                                        "id": 48,
                                        "booking_id": 76,
                                        "name": "ken",
                                        "phone": 67578441,
                                        "gender": "M",
                                        "email": "ken@gmail.com",
                                        "created_at": "2018-12-27 21:50:59",
                                        "updated_at": "2018-12-27 21:50:59"
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        }
    }



   "/hotel/booking/create": {
        "post": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "Create a new hotel booking",
            "description": "Create a new hotel booking",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "description": "id of user",
                    "type": "integer",
                    "required" : true,
                    "name": "user_id",
                    "in": "formData"
                },
                {
                    "description": "id of hotel",
                    "type": "integer",
                    "required" : true,
                    "name": "hotel_id",
                    "in": "formData"
                },
                {
                    "description": "id of hotel room",
                    "type": "integer",
                    "required" : true,
                    "name": "hotel_room_id",
                    "in": "formData"
                },
                {
                    "description": "number of people in a booking",
                    "type": "integer",
                    "required" : true,
                    "name": "people",
                    "in": "formData"
                },
                {
                    "description": "start date of a booking",
                    "type": "string",
                    "required" : true,
                    "name": "in_date",
                    "in": "formData"
                },
                {
                    "description": "end date of a booking",
                    "type": "string",
                    "required" : true,
                    "name": "out_date",
                    "in": "formData"
                },
                {
                    "description": "booking date of a booking",
                    "type": "string",
                    "required" : true,
                    "name": "book_date",
                    "in": "formData"
                },
                {
                    "description": "total price of the booking",
                    "type": "number",
                    "required" : true,
                    "name": "total_price",
                    "in": "formData"
                },
                {
                    "description": "id of payment method",
                    "type": "integer",
                    "required" : true,
                    "name": "payment_method_id",
                    "in": "formData"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "booking": {
                              "id": 106,
                              "user_id": "11",
                              "hotel_id": "40",
                              "hotel_room_id": "21",
                              "people": "1",
                              "in_date": "2020-04-24",
                              "out_date": "2020-04-26",
                              "book_date": "2020-04-24",
                              "total_price": "1001",
                              "payment_method_id": "1",
                              "approved": 1,
                              "status": 1,
                              "created_at": "2020-04-24 12:51:06",
                              "updated_at": "2020-04-24 12:51:06"
                            }
                        }
                    }
                }
            }
        }
    }



   "/hotel/booking/payment/{book_id}": {
        "post": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "Create a new payment object for a booking",
            "description": "Create a new payment object for a booking",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "description": "id of a booking object",
                    "type": "integer",
                    "required" : true,
                    "name": "book_id",
                    "in": "path"
                },
                {
                    "description": "id of a payment method",
                    "type": "integer",
                    "required" : true,
                    "name": "payment_method_id",
                    "in": "formData"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "book_id": "106",
                            "create_obj": {
                              "booking_id": "106",
                              "user_id": 11,
                              "single_price": 1500,
                              "handling_price": 25,
                              "total_price": 1001,
                              "payment_method_id": "1",
                              "created_at": "2020-04-24 14:52:43",
                              "updated_at": "2020-04-24 14:52:43",
                              "status": 1
                            },
                            "payment": {
                              "id": 108,
                              "booking_id": "106",
                              "user_id": 11,
                              "single_price": 1500,
                              "handling_price": 25,
                              "total_price": 1001,
                              "payment_method_id": "1",
                              "status": 1
                            }
                        }
                    }
                }
            }
        }
    }



   "/hotel/booking/guest/{book_id}": {
        "post": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "Create a new payment object for a booking",
            "description": "Create a new payment object for a booking",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "description": "id of a booking object",
                    "type": "integer",
                    "required" : true,
                    "name": "book_id",
                    "in": "path"
                },
                {
                    "description": "JSON string of guest infomation of a booking",
                    "type": "string",
                    "required" : true,
                    "name": "guest_json",
                    "in": "formData"
                }
            ],
            "responses": {
                "EXAMPLE": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "guest": [
                              {
                                "name": "KENIP",
                                "phone": "12345678",
                                "gender": "M",
                                "email": "test@gmail.com"
                              },
                              {
                                "name": "KENCHAN",
                                "phone": "63269874",
                                "gender": "F",
                                "email": "test2@gmail.com"
                              }
                            ]
                        }
                    }
                },
                "200": {
                    "description": "The example json object format of guest_json",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "book_id": "106",
                            "guest_json": {
                              "guest": [
                                {
                                  "name": "KENIP",
                                  "phone": "12345678",
                                  "gender": "M",
                                  "email": "test@gmail.com"
                                },
                                {
                                  "name": "KENCHAN",
                                  "phone": "63269874",
                                  "gender": "F",
                                  "email": "test2@gmail.com"
                                }
                              ]
                            },
                            "created": [
                              {
                                "id": 109,
                                "booking_id": "106",
                                "name": "KENIP",
                                "phone": "12345678",
                                "gender": "M",
                                "email": "test@gmail.com",
                                "created_at": "2020-04-24 15:14:18",
                                "updated_at": "2020-04-24 15:14:18"
                              },
                              {
                                "id": 110,
                                "booking_id": "106",
                                "name": "KENCHAN",
                                "phone": "63269874",
                                "gender": "F",
                                "email": "test2@gmail.com",
                                "created_at": "2020-04-24 15:14:18",
                                "updated_at": "2020-04-24 15:14:18"
                              }
                            ]
                        }
                    }
                }
            }
        }
    }



   "/hotel/trip_match/{tripid}/{bookid}": {
        "put": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "Match a trip object and booking object",
            "description": "Match a trip object and booking object",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "description": "id of a trip object",
                    "type": "integer",
                    "required" : true,
                    "name": "tripid",
                    "in": "path"
                },
               {
                    "description": "id of a booking object",
                    "type": "integer",
                    "required" : true,
                    "name": "bookid",
                    "in": "path"
                }
            ],
            "responses": {
                "200": {
                    "description": "The example json object format of guest_json",
                    "examples" : {
                        "application/json": {
                            "result": "success"
                        }
                    }
                }
            }
        }
    }






*
*/
